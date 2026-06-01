// validators/auth.validator.js
const { body, validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

// ─── Reusable: run validation and pass errors to next() ───────────────────────
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Grab only the first error message per field for clean UI display
        const message = errors.array({ onlyFirstError: true })[0].msg;
        return next(new AppError(message, 400));
    }
    next();
};

// ─── Register validation rules ────────────────────────────────────────────────
const registerRules = [
    body("fullName")
        .trim()
        .notEmpty().withMessage("Full name is required")
        .isLength({ min: 3 }).withMessage("Full name must be at least 3 characters")
        .isLength({ max: 50 }).withMessage("Full name cannot exceed 50 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/).withMessage("Password must contain at least one number"),
];

// ─── Login validation rules ───────────────────────────────────────────────────
const loginRules = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required"),
];

module.exports = {
    validateRegister: [...registerRules, validate],
    validateLogin: [...loginRules, validate],
};