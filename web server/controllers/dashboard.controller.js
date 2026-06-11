const Bot = require("../models/Bot");
const Conversation = require("../models/Conversation");
const ActivityLog = require("../models/ActivityLog");
const Usage = require("../models/Usage");
const User = require("../models/User");
const { getLimits } = require("../utils/plans");

// GET /api/dashboard/stats
const getStats = async (req, res, next) => {
    try {
        const userBots = await Bot.find({ userId: req.userId, status: { $ne: "deleted" } }).select("_id");
        const userBotIds = userBots.map(b => b._id);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [totalConversations, resolvedConversations, conversationsToday] = await Promise.all([
            Conversation.countDocuments({ botId: { $in: userBotIds }, isResolved: { $ne: null } }),
            Conversation.countDocuments({ botId: { $in: userBotIds }, isResolved: true }),
            Conversation.countDocuments({ botId: { $in: userBotIds }, createdAt: { $gte: todayStart } }),
        ]);

        const resolutionRate = totalConversations > 0
            ? Math.round((resolvedConversations / totalConversations) * 100)
            : 0;

        res.json({
            totalBots: userBots.length,
            totalConversations,
            resolvedConversations,
            resolutionRate,
            conversationsToday,
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/dashboard/recent-activity
const getRecentActivity = async (req, res, next) => {
    try {
        const activity = await ActivityLog.getRecent(req.userId);
        res.json({ activity });
    } catch (err) {
        next(err);
    }
};

// GET /api/dashboard/usage
const getUsage = async (req, res, next) => {
    try {
        const [user, usage] = await Promise.all([
            User.findById(req.userId),
            Usage.getUsage(req.userId),
        ]);

        const limits = getLimits(user.plan);

        res.json({
            plan: user.plan,
            usage: {
                messagesUsed: usage.messagesUsed,
                botsCreated: usage.botsCreated,
                sourcesUploaded: usage.sourcesUploaded,
            },
            limits: {
                messagesPerMonth: limits.messagesPerMonth,
                bots: limits.bots,
                sources: limits.sources,
            },
            period: {
                start: usage.periodStart,
                end: usage.periodEnd,
            },
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/dashboard/top-bots
const getTopBots = async (req, res, next) => {
    try {
        const userBots = await Bot.find({ userId: req.userId, status: "active" }).select("_id name");
        const userBotIds = userBots.map(b => b._id);

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);

        // Count conversations per bot this week
        const counts = await Conversation.aggregate([
            { $match: { botId: { $in: userBotIds }, createdAt: { $gte: weekStart } } },
            { $group: { _id: "$botId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);

        // Attach bot names and calculate relative bar width
        const max = counts[0]?.count || 1;
        const topBots = counts.map(c => {
            const bot = userBots.find(b => b._id.equals(c._id));
            return {
                id: c._id,
                name: bot?.name || "Unknown",
                count: c.count,
                value: Math.round((c.count / max) * 100), // percentage for bar width
            };
        });

        res.json({ topBots });
    } catch (err) {
        next(err);
    }
};

module.exports = { getStats, getRecentActivity, getUsage, getTopBots };