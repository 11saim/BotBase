const KnowledgeSource = require("../models/KnowledgeSource");
const Bot = require("../models/Bot");
const Usage = require("../models/Usage");
const ActivityLog = require("../models/ActivityLog");
const { ACTIVITY_EVENTS } = require("../models/ActivityLog");
const AppError = require("../utils/AppError");
const { canDo } = require("../utils/Plans");
const fs = require("fs");
const supabase = require("../config/supabase.js");

const PYTHON_SERVER = process.env.PYTHON_SERVER_URL || "http://localhost:3001";

async function consumeSSE(fetchResponse, onEvent) {
    if (!fetchResponse.body) throw new Error("Response body is empty");

    const reader = fetchResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);

            const lines = rawEvent.split("\n").filter(l => l.startsWith("data:"));
            for (const line of lines) {
                try {
                    const data = JSON.parse(line.replace(/^data:\s*/, ""));
                    const shouldStop = await onEvent(data);
                    if (shouldStop) {
                        reader.cancel().catch(() => { });
                        return;
                    }
                } catch (e) {
                    console.error("SSE parse/onEvent error:", e.message);
                }
            }
        }
    }
}

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
    let source = null;
    let storagePath = null;

    try {
        if (!req.file) return next(new AppError("PDF file is required", 400));

        const { botId } = req.params;

        const bot = await Bot.findOne({ _id: botId, userId: req.userId });
        if (!bot) {
            return next(new AppError("Bot not found", 404));
        }

        const usage = await Usage.getUsage(req.userId);
        if (!canDo(req.user.plan, "totalSources", usage.sourcesUploaded)) {
            return next(new AppError("Source upload limit reached for your plan", 403));
        }

        // --- Upload to Supabase instead of local disk ---
        storagePath = `${botId}/${Date.now()}-${req.file.originalname}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("knowledge-files")
            .upload(storagePath, req.file.buffer, {
                contentType: "application/pdf",
            });

        if (uploadError) {
            return next(new AppError("Failed to upload file to storage", 500));
        }

        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from("knowledge-files")
            .createSignedUrl(uploadData.path, 60 * 5);

        if (signedUrlError) {
            await supabase.storage.from("knowledge-files").remove([storagePath]);
            return next(new AppError("Failed to generate file access URL", 500));
        }

        source = await KnowledgeSource.create({
            botId,
            userId: req.userId,
            name: req.file.originalname,
            type: "pdf",
            filePath: storagePath,
            status: "processing",
        });

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const form = new FormData();
        form.append("fileUrl", signedUrlData.signedUrl);
        form.append("botId", botId);
        form.append("sourceId", source._id.toString());
        form.append("fileName", req.file.originalname)

        let pythonRes;
        try {
            pythonRes = await fetch(`${PYTHON_SERVER}/api/ingest/file`, {
                method: "POST",
                body: form,
            });
        } catch {
            await KnowledgeSource.findByIdAndDelete(source._id);
            await supabase.storage.from("knowledge-files").remove([storagePath]);
            res.write(`data: ${JSON.stringify({ error: "AI service is offline. Please try again later." })}\n\n`);
            return res.end();
        }

        if (!pythonRes.ok) {
            await KnowledgeSource.findByIdAndDelete(source._id);
            await supabase.storage.from("knowledge-files").remove([storagePath]);
            res.write(`data: ${JSON.stringify({ error: "Ingest service unavailable" })}\n\n`);
            return res.end();
        }

        await consumeSSE(pythonRes, async (data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);

            if (data.error) {
                await KnowledgeSource.findByIdAndDelete(source._id);
                await supabase.storage.from("knowledge-files").remove([storagePath]).catch(() => { });
                res.end();
                return true;
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

                // Optional: delete the source PDF from Supabase now that it's ingested,
                // if you don't need to keep the original around
                // await supabase.storage.from("knowledge-files").remove([storagePath]);

                res.end();
                return true;
            }

            return false;
        });

    } catch (err) {
        if (source?._id) {
            await KnowledgeSource.findByIdAndDelete(source._id).catch(() => { });
        }
        if (storagePath) {
            await supabase.storage.from("knowledge-files").remove([storagePath]).catch(() => { });
        }

        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ error: "Something went wrong while processing the file." })}\n\n`);
            return res.end();
        }
        next(err);
    }
};

// POST /api/bots/:botId/knowledge/text
const uploadText = async (req, res, next) => {
    let source = null;

    try {
        const { botId } = req.params;
        const { text, name } = req.body;

        if (!text) return next(new AppError("Text content is required", 400));

        const bot = await Bot.findOne({ _id: botId, userId: req.userId });
        if (!bot) return next(new AppError("Bot not found", 404));

        const usage = await Usage.getUsage(req.userId);
        if (!canDo(req.user.plan, "totalSources", usage.sourcesUploaded)) {
            return next(new AppError("Source upload limit reached for your plan", 403));
        }

        source = await KnowledgeSource.create({
            botId,
            userId: req.userId,
            name: name || "Pasted text",
            type: "text",
            rawText: text,
            status: "processing",
        });

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        let pythonRes;
        try {
            pythonRes = await fetch(`${PYTHON_SERVER}/api/ingest/text`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    botId,
                    sourceId: source._id.toString(),
                    botName: name || "Pasted text",
                }),
            });
        } catch {
            await KnowledgeSource.findByIdAndDelete(source._id);
            res.write(`data: ${JSON.stringify({ error: "AI service is offline. Please try again later." })}\n\n`);
            return res.end();
        }

        if (!pythonRes.ok) {
            await KnowledgeSource.findByIdAndDelete(source._id);
            res.write(`data: ${JSON.stringify({ error: "Ingest service unavailable" })}\n\n`);
            return res.end();
        }

        await consumeSSE(pythonRes, async (data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);

            if (data.error) {
                await KnowledgeSource.findByIdAndDelete(source._id);
                res.end();
                return true;
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

                res.end();
                return true;
            }

            return false;
        });

    } catch (err) {
        if (source?._id) {
            await KnowledgeSource.findByIdAndDelete(source._id).catch(() => { });
        }

        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ error: "Something went wrong while processing the text." })}\n\n`);
            return res.end();
        }
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
        const source = await KnowledgeSource.findOne({
            _id: req.params.id,
            botId: req.params.botId,
        });
        if (!source || source.status === "deleted") return next(new AppError("Source not found", 404));

        const wasActive = source.status === "active";

        source.status = "deleted";
        await source.save();

        if (wasActive) {
            await Usage.increment(req.userId, "sourcesUploaded", -1);
        }

        const bot = await Bot.findById(req.params.botId).select("name");

        await ActivityLog.log({
            userId: req.userId,
            botId: req.params.botId,
            eventType: ACTIVITY_EVENTS.SOURCE_DELETED,
            title: `'${source.name}' removed from ${bot?.name || "bot"}`,
        });

        res.json({ message: "Source deleted" });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllSources, uploadPDF, uploadText, updateStatus, deleteSource };