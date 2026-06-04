const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Bot = require("../models/Bot");
const AppError = require("../utils/AppError");

// GET /api/conversations?botId=all&status=all&period=all
const getAllConversations = async (req, res, next) => {
    try {
        const { botId, status, period } = req.query;

        const userBots = await Bot.find({ userId: req.userId, status: { $ne: "deleted" } }).select("_id");
        const userBotIds = userBots.map(b => b._id);

        const query = {};

        // Only return classified conversations
        query.isResolved = { $ne: null };

        // Bot filter
        query.botId = botId && botId !== "all"
            ? botId
            : { $in: userBotIds };

        // Status filter
        if (status === "resolved") query.isResolved = true;
        if (status === "unresolved") query.isResolved = false;
        // status=all → keep { $ne: null } already set above

        // Period filter
        const periodMap = { today: 1, "7d": 7, "30d": 30 };
        if (period && period !== "all" && periodMap[period]) {
            query.lastMessageAt = {
                $gte: new Date(Date.now() - periodMap[period] * 24 * 60 * 60 * 1000)
            };
        }
        // period=all → no date filter

        const conversations = await Conversation.find(query)
            .sort({ lastMessageAt: -1 })
            .populate("botId", "name");

        res.json({ conversations });
    } catch (err) {
        next(err);
    }
};

// GET /api/conversations/:id
const getConversation = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .populate("botId", "name");
        if (!conversation) return next(new AppError("Conversation not found", 404));

        const messages = await Message.find({ conversationId: conversation._id })
            .sort({ createdAt: 1 });

        res.json({ conversation, messages });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/conversations/:id
const deleteConversation = async (req, res, next) => {
    try {
        const conversation = await Conversation.findByIdAndDelete(req.params.id);
        if (!conversation) return next(new AppError("Conversation not found", 404));

        await Message.deleteMany({ conversationId: conversation._id });

        res.json({ message: "Conversation deleted" });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllConversations, getConversation, deleteConversation };