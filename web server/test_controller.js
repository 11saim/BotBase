const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const { uploadPDF } = require("./controllers/knowledge.controller");
const Bot = require("./models/Bot");
const KnowledgeSource = require("./models/KnowledgeSource");
const Usage = require("./models/Usage");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/botbase";

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("✓ Connected");

        // Find a valid bot
        const bot = await Bot.findOne({ status: { $ne: "deleted" } });
        if (!bot) {
            console.error("No bots found in database to run test");
            return;
        }

        const botId = bot._id.toString();
        const userId = bot.userId.toString();
        console.log(`Using Bot: ${botId}, User: ${userId}`);

        // Reset usage sourcesUploaded to 0 for test purposes
        await Usage.findOneAndUpdate({ userId }, { sourcesUploaded: 0 });
        console.log("✓ Reset sourcesUploaded to 0 for test user");

        // Create a dummy TXT file for multer mock
        const dummyTxtPath = path.join(__dirname, "uploads", `test-${Date.now()}.txt`);
        if (!fs.existsSync(path.join(__dirname, "uploads"))) {
            fs.mkdirSync(path.join(__dirname, "uploads"));
        }
        fs.writeFileSync(dummyTxtPath, "This is some dummy text to ensure we have enough characters for chunking. " + "a".repeat(100));

        // Mock req
        const req = {
            params: { botId },
            userId,
            user: { plan: "free" },
            file: {
                path: dummyTxtPath,
                originalname: "test_dummy.txt",
            }
        };

        // Mock res
        const res = {
            headers: {},
            setHeader(name, value) {
                this.headers[name] = value;
                console.log(`[res.setHeader] ${name}: ${value}`);
            },
            write(chunk) {
                console.log(`[res.write] ${chunk.toString().trim()}`);
            },
            end() {
                console.log("[res.end] Response stream ended");
                // Clean up dummy txt if it still exists
                if (fs.existsSync(dummyTxtPath)) {
                    try { fs.unlinkSync(dummyTxtPath); } catch(e) {}
                }
                mongoose.disconnect().then(() => {
                    console.log("Disconnected from MongoDB. Test Success!");
                    process.exit(0);
                });
            }
        };

        // Mock next
        const next = (err) => {
            console.error("[next] Express error middleware triggered:", err);
            if (fs.existsSync(dummyTxtPath)) {
                try { fs.unlinkSync(dummyTxtPath); } catch(e) {}
            }
            mongoose.disconnect().then(() => {
                process.exit(1);
            });
        };

        console.log("Invoking uploadPDF controller...");
        await uploadPDF(req, res, next);

    } catch (err) {
        console.error("Test setup error:", err);
        mongoose.disconnect();
    }
}

run();
