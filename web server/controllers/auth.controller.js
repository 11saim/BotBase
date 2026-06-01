const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Usage = require("../models/Usage");
const AppError = require("../utils/AppError");

// ─── Cookie config ────────────────────────────────────────────────────────────
const COOKIE_OPTIONS = {
    httpOnly: true,   // JS can't access it — safe from XSS attacks
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // blocks CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError("Email already in use", 409));
        }

        // Create user
        const user = await User.create({
            fullName,
            email,
            passwordHash: password,
        });

        // Create usage doc for free plan
        await Usage.create({
            userId: user._id,
            periodStart: new Date(),
            periodEnd: null,
        });

        res.status(201).json({ user });

    } catch (err) {
        next(err);
    }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError("Invalid email or password", 401));
        }

        // Check account is active
        if (!user.isActive) {
            return next(new AppError("Your account has been deactivated", 403));
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return next(new AppError("Invalid email or password", 401));
        }

        // Set token in cookie
        const token = generateToken(user._id);
        res.cookie("token", token, COOKIE_OPTIONS);

        res.json({ user });

    } catch (err) {
        next(err);
    }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
const logout = async (req, res, next) => {
    // Clear the cookie
    res.clearCookie("token", COOKIE_OPTIONS);
    res.json({ message: "Logged out successfully" });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const me = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        res.json({ user });

    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, logout, me };