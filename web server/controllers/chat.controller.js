const Bot = require("../models/Bot");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Usage = require("../models/Usage");
const ActivityLog = require("../models/ActivityLog");
const { ACTIVITY_EVENTS } = require("../models/ActivityLog");
const AppError = require("../utils/AppError");
const { canDo } = require("../utils/Plans");

// POST /api/chat/start
const startConversation = async (req, res, next) => {
    try {
        const { botId, sessionId } = req.body;

        if (!botId || !sessionId) {
            return next(new AppError("botId and sessionId are required", 400));
        }

        const bot = await Bot.findById(botId);
        if (!bot || bot.status === "deleted") return next(new AppError("Bot not found", 404));
        if (bot.status === "paused") return res.json({ paused: true, message: bot.widgetConfig.pausedMessage });
        if (bot.status === "locked") return res.json({ paused: true, message: "This bot is currently unavailable." });

        // Resume existing open conversation
        let conversation = await Conversation.findOne({ sessionId, endedAt: null });
        if (conversation) {
            const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
            return res.json({ conversation, messages, welcomeMessage: null });
        }

        // Start fresh
        conversation = await Conversation.create({ botId, sessionId });
        res.json({ conversation, messages: [], welcomeMessage: bot.widgetConfig.welcomeMessage });

    } catch (err) {
        next(err);
    }
};

// POST /api/chat/message
const sendMessage = async (req, res, next) => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            return next(new AppError("sessionId and message are required", 400));
        }

        const conversation = await Conversation.findOne({ sessionId, endedAt: null });
        if (!conversation) return next(new AppError("Conversation not found or already ended", 404));

        const bot = await Bot.findById(conversation.botId);
        const user = await require("../models/User").findById(bot.userId);

        // Check plan limit
        const usage = await Usage.getUsage(bot.userId);
        if (!canDo(user.plan, "messagesPerMonth", usage.messagesUsed)) {
            return res.json({ error: "This bot has reached its monthly message limit." });
        }

        // Save user message
        await Message.create({ conversationId: conversation._id, role: "user", content: message });
        await Conversation.findByIdAndUpdate(conversation._id, {
            $inc: { messageCount: 1 },
            lastMessageAt: new Date(),
        });

        // SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        // Call Python RAG server
        const ragResponse = await fetch(`${process.env.PYTHON_SERVER_URL}/api/chat/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                botId: bot._id.toString(),
                message,
                botSettings: {
                    language: bot.widgetConfig.language,
                    responseStyle: bot.widgetConfig.responseStyle,
                    fallbackReply: bot.widgetConfig.fallbackReply,
                },
            }),
        });

        if (!ragResponse.ok) {
            res.write(`data: ${JSON.stringify({ error: "AI service unavailable" })}\n\n`);
            res.end();
            return;
        }

        // Stream tokens from Python → widget
        // Stream tokens from Python → widget
        let fullReply = "";
        const reader = ragResponse.body.getReader();
        const decoder = require("util").TextDecoder ? new (require("util").TextDecoder)() : new TextDecoder();
        let buffer = "";

        while (true) {
            const { value, done: streamDone } = await reader.read();
            if (streamDone) break;

            buffer += decoder.decode(value, { stream: true });

            // Split on the SSE event delimiter, keep any incomplete trailing chunk in buffer
            const events = buffer.split("\n\n");
            buffer = events.pop();

            for (const evt of events) {
                const line = evt.trim();
                if (!line.startsWith("data:")) continue;

                let data;
                try {
                    data = JSON.parse(line.slice(5).trim());
                } catch {
                    continue;
                }

                if (data.error) {
                    res.write(`data: ${JSON.stringify({ error: data.error })}\n\n`);
                    res.end();
                    return;
                }

                if (data.token) {
                    fullReply += data.token;
                    res.write(`data: ${JSON.stringify({ token: data.token })}\n\n`);
                }

                if (data.done) {
                    await Message.create({ conversationId: conversation._id, role: "assistant", content: fullReply });
                    await Conversation.findByIdAndUpdate(conversation._id, { $inc: { messageCount: 1 } });
                    await Usage.increment(bot.userId, "messagesUsed");

                    const updatedUsage = await Usage.getUsage(bot.userId);
                    if (updatedUsage.messagesUsed === 100) await ActivityLog.log({ userId: bot.userId, botId: bot._id, eventType: ACTIVITY_EVENTS.BOT_MESSAGES_100, title: `${bot.name} hit 100 messages` });
                    if (updatedUsage.messagesUsed === 1000) await ActivityLog.log({ userId: bot.userId, botId: bot._id, eventType: ACTIVITY_EVENTS.BOT_MESSAGES_1000, title: `${bot.name} hit 1,000 messages` });

                    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                    res.end();
                    return;
                }
            }
        }

    } catch (err) {
        next(err);
    }
};

// POST /api/chat/ping
const ping = async (req, res, next) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return next(new AppError("sessionId is required", 400));

        await Conversation.findOneAndUpdate(
            { sessionId, endedAt: null },
            { lastMessageAt: new Date() }
        );

        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// POST /api/chat/check-session — check if a session is active without creating one
const checkSession = async (req, res, next) => {
    try {
        const { botId, sessionId } = req.body;

        if (!botId || !sessionId) {
            return next(new AppError("botId and sessionId are required", 400));
        }

        const conversation = await Conversation.findOne({ sessionId, endedAt: null });
        if (!conversation) {
            return res.json({ active: false });
        }

        const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
        res.json({ active: true, conversation, messages });
    } catch (err) {
        next(err);
    }
};

module.exports = { startConversation, checkSession, sendMessage, ping };