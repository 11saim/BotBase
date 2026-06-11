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

        const [totalBots, totalConversations, resolvedConversations] = await Promise.all([
            userBots.length,
            Conversation.countDocuments({ botId: { $in: userBotIds }, isResolved: { $ne: null } }),
            Conversation.countDocuments({ botId: { $in: userBotIds }, isResolved: true }),
        ]);

        const resolutionRate = totalConversations > 0
            ? Math.round((resolvedConversations / totalConversations) * 100)
            : 0;

        res.json({ totalBots, totalConversations, resolvedConversations, resolutionRate });
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

module.exports = { getStats, getRecentActivity, getUsage };