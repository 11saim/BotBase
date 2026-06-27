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
                sources: limits.totalSources,
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

// GET /api/dashboard/analytics?range=7d
const getAnalytics = async (req, res, next) => {
    try {
        const { range = "7d" } = req.query;

        const days = { "7d": 7, "30d": 30, "90d": 90 }[range] || 7;
        const rangeStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const userBots = await Bot.find({ userId: req.userId, status: { $ne: "deleted" } }).select("_id name");
        const userBotIds = userBots.map(b => b._id);

        const [
            totalConversations,
            resolvedConversations,
            unresolved,
            avgMsgs,
            overTime,
            perBot,
        ] = await Promise.all([

            // Total conversations in range
            Conversation.countDocuments({
                botId: { $in: userBotIds },
                isResolved: { $ne: null },
                createdAt: { $gte: rangeStart },
            }),

            // Resolved in range
            Conversation.countDocuments({
                botId: { $in: userBotIds },
                isResolved: true,
                createdAt: { $gte: rangeStart },
            }),

            // Unresolved in range
            Conversation.countDocuments({
                botId: { $in: userBotIds },
                isResolved: false,
                createdAt: { $gte: rangeStart },
            }),

            // Avg messages per conversation
            Conversation.aggregate([
                { $match: { botId: { $in: userBotIds }, createdAt: { $gte: rangeStart } } },
                { $group: { _id: null, avg: { $avg: "$messageCount" } } },
            ]),

            // Conversations over time — group by day (7d) or week (30d/90d)
            Conversation.aggregate([
                { $match: { botId: { $in: userBotIds }, createdAt: { $gte: rangeStart } } },
                {
                    $group: {
                        _id: days <= 7
                            ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                            : { $dateToString: { format: "%Y-W%V", date: "$createdAt" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id": 1 } },
            ]),

            // Per-bot conversation counts
            Conversation.aggregate([
                { $match: { botId: { $in: userBotIds }, createdAt: { $gte: rangeStart } } },
                { $group: { _id: "$botId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
        ]);

        const resolutionRate = totalConversations > 0
            ? Math.round((resolvedConversations / totalConversations) * 100)
            : 0;

        const avgMessages = avgMsgs[0]?.avg
            ? Math.round(avgMsgs[0].avg)
            : 0;

        // Attach bot names to per-bot data
        const max = perBot[0]?.count || 1;
        const perBotData = perBot.map(b => {
            const bot = userBots.find(u => u._id.equals(b._id));
            return {
                name: bot?.name || "Unknown",
                count: b.count,
                pct: Math.round((b.count / max) * 100),
            };
        });

        res.status(200).json({
            stats: {
                totalConversations,
                resolutionRate,
                avgMessagesPerConversation: avgMessages,
                unresolvedCount: unresolved,
            },
            overTime: overTime.map(d => ({ label: d._id, count: d.count })),
            resolution: {
                resolved: resolvedConversations,
                unresolved: unresolved,
                total: totalConversations,
            },
            perBot: perBotData,
        });

    } catch (err) {
        next(err);
    }
};

module.exports = { getStats, getRecentActivity, getUsage, getTopBots, getAnalytics };