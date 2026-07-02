const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Usage = require("../models/Usage");
const AppError = require("../utils/AppError");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Google account exists → link password to it
            if (existingUser.provider === "google" && !existingUser.passwordHash) {
                existingUser.passwordHash = password; // pre-save hook will hash it
                existingUser.fullName = existingUser.fullName || fullName;
                existingUser.provider = "both";
                await existingUser.save();

                const token = generateToken(existingUser._id);
                return res.status(200).json({ user: existingUser, token });
            }

            return next(new AppError("User with this email already exists", 409));
        }

        // Fresh registration
        const user = await User.create({ fullName, email, passwordHash: password });

        await Usage.create({
            userId: user._id,
            periodStart: new Date(),
            periodEnd: null,
        });

        const token = generateToken(user._id);

        res.status(201).json({ user, token });

    } catch (err) {
        next(err);
    }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return next(new AppError("Invalid email or password", 401));

        if (!user.isActive) return next(new AppError("Your account has been deactivated", 403));

        // Google-only account trying to use password login
        if (user.provider === "google" && !user.passwordHash) {
            return next(new AppError("This account uses Google sign-in. Please continue with Google.", 401));
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return next(new AppError("Invalid email or password", 401));

        const token = generateToken(user._id);
        res.status(200).json({ user, token });

    } catch (err) {
        next(err);
    }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
const logout = async (req, res, next) => {
    res.status(200).json({ message: "Logged out successfully" });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const me = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return next(new AppError("User not found", 404));
        res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/auth/google ────────────────────────────────────────────────────
const googleAuth = async (req, res, next) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, sub, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Brand new user via Google
            user = await User.create({
                fullName: name,
                email,
                passwordHash: null,
                googleId: sub,
                avatar: picture,
                provider: "google",
            });

            await Usage.create({
                userId: user._id,
                periodStart: new Date(),
                periodEnd: null,
            });

        } else {
            // Existing email/password account → link Google to it
            if (!user.googleId) {
                user.googleId = sub;
                user.avatar = user.avatar || picture;
                user.provider = user.passwordHash ? "both" : "google";
                await user.save();
            }
            // if already fully linked → just log in, no changes needed
        }

        const authToken = generateToken(user._id);
        res.status(200).json({ user, token: authToken });

    } catch (err) {
        console.error("Google auth error:", err);
        next(new AppError("Google authentication failed", 401));
    }
};

module.exports = { register, login, logout, me, googleAuth };