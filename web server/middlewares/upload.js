const multer = require("multer");
const path = require("path");
const AppError = require("./AppError");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        // e.g. botId-timestamp.pdf
        const name = `${req.params.botId}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, name);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new AppError("Only PDF files are allowed", 400));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

module.exports = upload;