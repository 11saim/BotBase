const KnowledgeSource = require("../models/KnowledgeSource");
const Bot = require("../models/Bot");
const Usage = require("../models/Usage");
const ActivityLog = require("../models/ActivityLog");
const { ACTIVITY_EVENTS } = require("../models/ActivityLog");
const AppError = require("../utils/AppError");
const { canDo } = require("../utils/plans");
const fs = require("fs");
const FormData = require("form-data");

const PYTHON_SERVER = process.env.PYTHON_SERVER_URL || "http://localhost:3001";

// GET /api/bots/:botId/knowledge
const getAllSources = async (req, res, next) => {
    try {
        const sources = await KnowledgeSource.find({
            botId: req.params.botId,
            status: { $ne: "deleted" },
        }).sort({ createdAt: -1 });

        res.json({ sources });
    } catch (err) {
        next(err);
    }
};

// POST /api/bots/:botId/knowledge/pdf
const uploadPDF = async (req, res, next) => {
    try {
        if (!req.file) return next(new AppError("PDF file is required", 400));

        const { botId } = req.params;

        const bot = await Bot.findOne({ _id: botId, userId: req.userId });
        if (!bot) {
            fs.unlinkSync(req.file.path);
            return next(new AppError("Bot not found", 404));
        }

        const usage = await Usage.getUsage(req.userId);
        if (!canDo(req.user.plan, "fileUploadsPerBot", usage.sourcesUploaded)) {
            fs.unlinkSync(req.file.path);
            return next(new AppError("Source upload limit reached for your plan", 403));
        }

        // Create source first to get _id — Python needs it as sourceId
        const source = await KnowledgeSource.create({
            botId,
            userId: req.userId,
            name: req.file.originalname,
            type: "pdf",
            filePath: req.file.path,
            status: "processing",
        });

        // SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        // Forward file to Python with sourceId
        const form = new FormData();
        form.append("file", fs.createReadStream(req.file.path), req.file.originalname);
        form.append("botId", botId);
        form.append("sourceId", source._id.toString());

        const pythonRes = await fetch(`${PYTHON_SERVER}/api/ingest/file`, {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
        });

        if (!pythonRes.ok) {
            await KnowledgeSource.findByIdAndDelete(source._id);
            fs.unlinkSync(req.file.path);
            res.write(`data: ${JSON.stringify({ error: "Ingest service unavailable" })}\n\n`);
            return res.end();
        }

        // Stream Python progress to frontend
        for await (const chunk of pythonRes.body) {
            const lines = chunk.toString().split("\n").filter(l => l.startsWith("data:"));

            for (const line of lines) {
                const data = JSON.parse(line.replace("data: ", ""));

                res.write(`data: ${JSON.stringify(data)}\n\n`);

                if (data.error) {
                    // Processing failed — delete the doc
                    await KnowledgeSource.findByIdAndDelete(source._id);
                    fs.unlinkSync(req.file.path);
                    return res.end();
                }

                if (data.done) {
                    // Processing succeeded — update source to active
                    await KnowledgeSource.findByIdAndUpdate(source._id, {
                        status: "active",
                        chunkCount: data.chunkCount,
                        faissPath: `storage/faiss/${botId}.index`,
                    });

                    await Usage.increment(req.userId, "sourcesUploaded");

                    await ActivityLog.log({
                        userId: req.userId,
                        botId: bot._id,
                        eventType: ACTIVITY_EVENTS.SOURCE_UPLOADED,
                        title: `'${source.name}' added to ${bot.name}`,
                    });

                    return res.end();
                }
            }
        }

    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(err);
    }
};

// POST /api/bots/:botId/knowledge/text
const uploadText = async (req, res, next) => {
    try {
        const { botId } = req.params;
        const { text, name } = req.body;

        if (!text) return next(new AppError("Text content is required", 400));

        const bot = await Bot.findOne({ _id: botId, userId: req.userId });
        if (!bot) return next(new AppError("Bot not found", 404));

        const usage = await Usage.getUsage(req.userId);
        if (!canDo(req.user.plan, "fileUploadsPerBot", usage.sourcesUploaded)) {
            return next(new AppError("Source upload limit reached for your plan", 403));
        }

        // Create source first to get _id
        const source = await KnowledgeSource.create({
            botId,
            userId: req.userId,
            name: name || "Pasted text",
            type: "text",
            rawText: text,
            status: "processing",
        });

        // SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const pythonRes = await fetch(`${PYTHON_SERVER}/api/ingest/text`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                botId,
                sourceId: source._id.toString(),
                botName: name || "Pasted text",
            }),
        });

        if (!pythonRes.ok) {
            await KnowledgeSource.findByIdAndDelete(source._id);
            res.write(`data: ${JSON.stringify({ error: "Ingest service unavailable" })}\n\n`);
            return res.end();
        }

        for await (const chunk of pythonRes.body) {
            const lines = chunk.toString().split("\n").filter(l => l.startsWith("data:"));

            for (const line of lines) {
                const data = JSON.parse(line.replace("data: ", ""));

                res.write(`data: ${JSON.stringify(data)}\n\n`);

                if (data.error) {
                    await KnowledgeSource.findByIdAndDelete(source._id);
                    return res.end();
                }

                if (data.done) {
                    await KnowledgeSource.findByIdAndUpdate(source._id, {
                        status: "active",
                        chunkCount: data.chunkCount,
                        faissPath: `storage/faiss/${botId}.index`,
                    });

                    await Usage.increment(req.userId, "sourcesUploaded");

                    await ActivityLog.log({
                        userId: req.userId,
                        botId: bot._id,
                        eventType: ACTIVITY_EVENTS.SOURCE_UPLOADED,
                        title: `'${source.name}' added to ${bot.name}`,
                    });

                    return res.end();
                }
            }
        }

    } catch (err) {
        next(err);
    }
};

// PATCH /api/bots/:botId/knowledge/:id/status
const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!["active", "paused"].includes(status)) {
            return next(new AppError("Status must be active or paused", 400));
        }

        const source = await KnowledgeSource.findOneAndUpdate(
            { _id: req.params.id, botId: req.params.botId },
            { status },
            { new: true }
        );
        if (!source) return next(new AppError("Source not found", 404));

        res.json({ source });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/bots/:botId/knowledge/:id
const deleteSource = async (req, res, next) => {
    try {
        const source = await KnowledgeSource.findOneAndUpdate(
            { _id: req.params.id, botId: req.params.botId },
            { status: "deleted" },
            { new: true }
        );
        if (!source) return next(new AppError("Source not found", 404));

        res.json({ message: "Source deleted" });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllSources, uploadPDF, uploadText, updateStatus, deleteSource };