const Bot = require("../models/Bot");
const AppError = require("../utils/AppError");

const getPublicBotConfig = async (req, res, next) => {
    try {
        const bot = await Bot.findById(req.params.id).select("name botAvatar widgetConfig status");
        if (!bot || bot.status === "deleted") return next(new AppError("Bot not found", 404));
        res.json({ bot });
    } catch (err) { next(err); }
};

module.exports = { getPublicBotConfig };