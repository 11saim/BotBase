const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const protect = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new AppError("Not authenticated", 401));
        }
        const token = authHeader.split(" ")[1];

        // 2. Check if token exists
        if (!token) {
            return next(new AppError("You are not logged in. Please log in to gain access.", 401));
        }

        // 3. Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return next(new AppError("Invalid or expired token. Please log in again.", 401));
        }

        // 4. Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return next(new AppError("The user belonging to this token no longer exists.", 401));
        }

        // 5. Grant access
        req.userId = user._id;
        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { protect };
