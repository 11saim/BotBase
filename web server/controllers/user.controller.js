const User = require("../models/User");
const AppError = require("../utils/AppError");

// PATCH /api/user/profile
const updateProfile = async (req, res, next) => {
    try {
        const { fullName } = req.body;

        if (!fullName || fullName.trim().length < 2) {
            return next(new AppError("Full name must be at least 2 characters", 400));
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { fullName },
            { new: true, runValidators: true }
        );

        res.json({ user });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/user/password
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return next(new AppError("Current and new password are required", 400));
        }

        if (newPassword.length < 8) {
            return next(new AppError("New password must be at least 8 characters", 400));
        }

        const user = await User.findById(req.userId);

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return next(new AppError("Current password is incorrect", 401));

        // pre("save") hook will hash the new password
        user.passwordHash = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/user
const deleteAccount = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.userId, { isActive: false });

        res.clearCookie("token");
        res.json({ message: "Account deleted successfully" });
    } catch (err) {
        next(err);
    }
};

module.exports = { updateProfile, changePassword, deleteAccount };