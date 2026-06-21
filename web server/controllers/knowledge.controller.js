const KnowledgeSource = require("../models/KnowledgeSource");
const Bot = require("../models/Bot");
const Usage = require("../models/Usage");
const ActivityLog = require("../models/ActivityLog");
const { ACTIVITY_EVENTS } = require("../models/ActivityLog");
const AppError = require("../utils/AppError");
const { canDo } = require("../utils/plans");
const fs = require("fs");

const PYTHON_SERVER = process.env.PYTHON_SERVER_URL || "http://localhost:3001";

function debugLog(...args) {
    const msg = `[${new Date().toISOString()}] ${args.map(x => typeof x === 'object' ? JSON.stringify(x) : x).join(" ")}\n`;
    try {
        fs.appendFileSync(require("path").join(__dirname, "../debug_log.txt"), msg);
    } catch (e) {
        console.error("Failed to write to debug log file:", e);
    }
    console.log(...args);
}

async function consumeSSE(fetchResponse, onEvent) {
    debugLog("consumeSSE: Starting stream consumption...");
    if (!fetchResponse.body) {
        debugLog("consumeSSE: fetchResponse.body is null or undefined!");
        throw new Error("Response body is empty");
    }

    let reader;
    try {
        reader = fetchResponse.body.getReader();
        debugLog("consumeSSE: successfully acquired stream reader.");
    } catch (err) {
        debugLog("consumeSSE: failed to get reader:", err.message);
        throw err;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
        while (true) {
            debugLog("consumeSSE: waiting for reader.read()...");
            const { done, value } = await reader.read();
            debugLog(`consumeSSE: read chunk. done=${done}, valueLength=${value ? value.length : 0}`);
            if (done) {
                debugLog("consumeSSE: stream reached end (done=true)");
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            debugLog(`consumeSSE: decoded buffer length is now ${buffer.length}`);

            // SSE events are separated by double newlines
            let boundary;
            while ((boundary = buffer.indexOf("\n\n")) !== -1) {
                const rawEvent = buffer.slice(0, boundary);
                buffer = buffer.slice(boundary + 2);
                debugLog(`consumeSSE: found event boundary. rawEvent length: ${rawEvent.length}`);

                const lines = rawEvent.split("\n").filter(l => l.startsWith("data:"));
                for (const line of lines) {
                    try {
                        const json = line.replace(/^data:\s*/, "");
                        const data = JSON.parse(json);
                        debugLog("consumeSSE: parsed SSE event data:", data);
                        const shouldStop = await onEvent(data);
                        debugLog("consumeSSE: onEvent returned shouldStop =", shouldStop);
                        if (shouldStop) {
                            debugLog("consumeSSE: stopping stream consumption because onEvent returned true");
                            reader.cancel().catch(e => debugLog("consumeSSE: reader.cancel error:", e.message));
                            return;
                        }
                    } catch (e) {
                        debugLog("consumeSSE: error parsing line or executing onEvent:", e.message, "| line:", line);
                        console.error("SSE parse/onEvent error:", e.message, "| raw:", line);
                    }
                }
            }
        }
        debugLog("consumeSSE: finished loop, buffer remaining length:", buffer.length);
    } catch (err) {
        debugLog("consumeSSE: error inside reading loop:", err.message);
        throw err;
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
    debugLog("uploadPDF: Start request handling for botId:", req.params.botId);
    try {
        if (!req.file) {
            debugLog("uploadPDF: no file provided");
            return next(new AppError("PDF file is required", 400));
        }

        const { botId } = req.params;
        debugLog("uploadPDF: req.file.path:", req.file.path, "original name:", req.file.originalname);

        const bot = await Bot.findOne({ _id: botId, userId: req.userId });
        if (!bot) {
            debugLog("uploadPDF: Bot not found in DB with id:", botId, "userId:", req.userId);
            fs.unlinkSync(req.file.path);
            return next(new AppError("Bot not found", 404));
        }

        const usage = await Usage.getUsage(req.userId);
        debugLog("uploadPDF: Current sourcesUploaded count:", usage.sourcesUploaded);
        if (!canDo(req.user.plan, "fileUploadsPerBot", usage.sourcesUploaded)) {
            debugLog("uploadPDF: Plan limit reached!");
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
        debugLog("uploadPDF: Created temporary KnowledgeSource in DB. ID:", source._id.toString());

        // SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        debugLog("uploadPDF: Sent SSE headers to client");

        // Forward file to Python with sourceId — use native FormData/Blob,
        // NOT the 'form-data' npm package, which corrupts multipart boundaries
        // when used with Node's built-in fetch (undici).
        const fileBuffer = fs.readFileSync(req.file.path);
        const form = new FormData();
        form.append("file", new Blob([fileBuffer]), req.file.originalname);
        form.append("botId", botId);
        form.append("sourceId", source._id.toString());

        debugLog("uploadPDF: sending request to Python server at:", `${PYTHON_SERVER}/api/ingest/file`);
        const pythonRes = await fetch(`${PYTHON_SERVER}/api/ingest/file`, {
            method: "POST",
            body: form,
        });

        debugLog("uploadPDF: Python server responded with status:", pythonRes.status);

        if (!pythonRes.ok) {
            debugLog("uploadPDF: Python response not OK. Deleting temp knowledge source");
            await KnowledgeSource.findByIdAndDelete(source._id);
            fs.unlinkSync(req.file.path);
            res.write(`data: ${JSON.stringify({ error: "Ingest service unavailable" })}\n\n`);
            return res.end();
        }

        // Stream Python progress to frontend (buffered SSE parsing via getReader)
        await consumeSSE(pythonRes, async (data) => {
            debugLog("uploadPDF: consumeSSE callback got event:", data);
            res.write(`data: ${JSON.stringify(data)}\n\n`);

            if (data.error) {
                debugLog("uploadPDF: Error event received from python, cleanup...");
                await KnowledgeSource.findByIdAndDelete(source._id);
                fs.unlinkSync(req.file.path);
                res.end();
                return true; // stop
            }

            if (data.done) {
                debugLog("uploadPDF: Done event received! Finalizing in DB...");
                await KnowledgeSource.findByIdAndUpdate(source._id, {
                    status: "active",
                    chunkCount: data.chunkCount,
                    faissPath: `storage/faiss/${botId}.index`,
                });

                debugLog("uploadPDF: Incrementing sourcesUploaded...");
                await Usage.increment(req.userId, "sourcesUploaded");

                debugLog("uploadPDF: Writing ActivityLog...");
                await ActivityLog.log({
                    userId: req.userId,
                    botId: bot._id,
                    eventType: ACTIVITY_EVENTS.SOURCE_UPLOADED,
                    title: `'${source.name}' added to ${bot.name}`,
                });

                debugLog("uploadPDF: Finalizing request response.");
                res.end();
                return true; // stop
            }

            return false; // continue
        });

    } catch (err) {
        debugLog("uploadPDF: Fatal error caught:", err.message);
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) { }
        }
        next(err);
    }
};

// POST /api/bots/:botId/knowledge/text
const uploadText = async (req, res, next) => {
    debugLog("uploadText: Start request handling for botId:", req.params.botId);
    try {
        const { botId } = req.params;
        const { text, name } = req.body;

        if (!text) {
            debugLog("uploadText: no text content provided");
            return next(new AppError("Text content is required", 400));
        }

        const bot = await Bot.findOne({ _id: botId, userId: req.userId });
        if (!bot) {
            debugLog("uploadText: Bot not found in DB with id:", botId, "userId:", req.userId);
            return next(new AppError("Bot not found", 404));
        }

        const usage = await Usage.getUsage(req.userId);
        debugLog("uploadText: Current sourcesUploaded count:", usage.sourcesUploaded);
        if (!canDo(req.user.plan, "fileUploadsPerBot", usage.sourcesUploaded)) {
            debugLog("uploadText: Plan limit reached!");
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
        debugLog("uploadText: Created temporary KnowledgeSource in DB. ID:", source._id.toString());

        // SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        debugLog("uploadText: Sent SSE headers to client");

        debugLog("uploadText: sending request to Python server at:", `${PYTHON_SERVER}/api/ingest/text`);
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

        debugLog("uploadText: Python server responded with status:", pythonRes.status);

        if (!pythonRes.ok) {
            debugLog("uploadText: Python response not OK. Deleting temp knowledge source");
            await KnowledgeSource.findByIdAndDelete(source._id);
            res.write(`data: ${JSON.stringify({ error: "Ingest service unavailable" })}\n\n`);
            return res.end();
        }

        await consumeSSE(pythonRes, async (data) => {
            debugLog("uploadText: consumeSSE callback got event:", data);
            res.write(`data: ${JSON.stringify(data)}\n\n`);

            if (data.error) {
                debugLog("uploadText: Error event received from python, cleanup...");
                await KnowledgeSource.findByIdAndDelete(source._id);
                res.end();
                return true; // stop
            }

            if (data.done) {
                debugLog("uploadText: Done event received! Finalizing in DB...");
                await KnowledgeSource.findByIdAndUpdate(source._id, {
                    status: "active",
                    chunkCount: data.chunkCount,
                    faissPath: `storage/faiss/${botId}.index`,
                });

                debugLog("uploadText: Incrementing sourcesUploaded...");
                await Usage.increment(req.userId, "sourcesUploaded");

                debugLog("uploadText: Writing ActivityLog...");
                await ActivityLog.log({
                    userId: req.userId,
                    botId: bot._id,
                    eventType: ACTIVITY_EVENTS.SOURCE_UPLOADED,
                    title: `'${source.name}' added to ${bot.name}`,
                });

                debugLog("uploadText: Finalizing request response.");
                res.end();
                return true; // stop
            }

            return false; // continue
        });

    } catch (err) {
        debugLog("uploadText: Fatal error caught:", err.message);
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

        // Only decrement if the source had been fully processed (active)
        // Sources still in "processing" were never counted against the quota
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