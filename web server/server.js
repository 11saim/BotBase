const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/botbase";

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("✓ Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`✓ Web server running at ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("✗ Database connection error:", err);
    });
