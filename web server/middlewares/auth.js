const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Get token from cookies or Authorization header
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

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
