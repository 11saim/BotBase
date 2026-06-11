const Bot = require("../models/Bot");
const Conversation = require("../models/Conversation");
const Usage = require("../models/Usage");
const ActivityLog = require("../models/ActivityLog");
const { ACTIVITY_EVENTS } = require("../models/ActivityLog");
const AppError = require("../utils/AppError");
const { canDo } = require("../utils/plans");

// GET /api/bots
const getAllBots = async (req, res, next) => {
    try {
        const bots = await Bot.find({ userId: req.userId, status: { $ne: "deleted" } });

        // Count conversations per bot
        const botIds = bots.map(b => b._id);
        const counts = await Conversation.aggregate([
            { $match: { botId: { $in: botIds } } },
            { $group: { _id: "$botId", count: { $sum: 1 } } }
        ]);

        const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));

        const botsWithCounts = bots.map(b => ({
            ...b.toObject(),
            conversationCount: countMap[b._id.toString()] || 0
        }));

        res.json({ bots: botsWithCounts });
    } catch (err) {
        next(err);
    }
};

// POST /api/bots
const createBot = async (req, res, next) => {
    try {
        const { name, description, botAvatar, widgetConfig } = req.body;

        if (!name) return next(new AppError("Bot name is required", 400));

        const usage = await Usage.getUsage(req.userId);
        if (!canDo(req.user.plan, "bots", usage.botsCreated)) {
            return next(new AppError("Bot limit reached for your plan", 403));
        }

        const bot = await Bot.create({
            userId: req.userId,
            name,
            description,
            botAvatar,
            widgetConfig,
        });

        await Usage.increment(req.userId, "botsCreated");

        await ActivityLog.log({
            userId: req.userId,
            botId: bot._id,
            eventType: ACTIVITY_EVENTS.BOT_CREATED,
            title: `New bot '${bot.name}' created`,
        });

        res.status(201).json({ bot });
    } catch (err) {
        next(err);
    }
};

// GET /api/bots/:id
const getBot = async (req, res, next) => {
    try {
        const bot = await Bot.findOne({ _id: req.params.id, userId: req.userId });
        if (!bot) return next(new AppError("Bot not found", 404));

        res.json({ bot });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/bots/:id  →  update name and description
const updateBot = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        const bot = await Bot.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { name, description },
            { new: true, runValidators: true }
        );
        if (!bot) return next(new AppError("Bot not found", 404));

        await ActivityLog.log({
            userId: req.userId,
            botId: bot._id,
            eventType: ACTIVITY_EVENTS.BOT_UPDATED,
            title: `Bot '${bot.name}' updated`,
        });

        res.json({ bot });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/bots/:id/appearance  →  update widgetConfig
const updateAppearance = async (req, res, next) => {
    try {
        // Build update object with only widgetConfig fields sent in body
        const updates = {};
        for (const key of Object.keys(req.body)) {
            updates[`widgetConfig.${key}`] = req.body[key];
        }

        const bot = await Bot.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!bot) return next(new AppError("Bot not found", 404));

        res.json({ bot });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/bots/:id/status  →  active or paused
const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!["active", "paused"].includes(status)) {
            return next(new AppError("Status must be active or paused", 400));
        }

        const bot = await Bot.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { status },
            { new: true }
        );
        if (!bot) return next(new AppError("Bot not found", 404));

        res.json({ bot });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/bots/:id  →  soft delete
const deleteBot = async (req, res, next) => {
    try {
        const bot = await Bot.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { status: "deleted" },
            { new: true }
        );
        if (!bot) return next(new AppError("Bot not found", 404));

        await ActivityLog.log({
            userId: req.userId,
            botId: bot._id,
            eventType: ACTIVITY_EVENTS.BOT_DELETED,
            title: `Bot '${bot.name}' deleted`,
        });

        res.json({ message: "Bot deleted" });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllBots, createBot, getBot, updateBot, updateAppearance, updateStatus, deleteBot };