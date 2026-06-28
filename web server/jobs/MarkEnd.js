const cron = require("node-cron");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// ─── Call OpenRouter LLM ──────────────────────────────────────────────────────
const callLLM = async (prompt) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
            model: `${process.env.LLM_MODEL}`,
            messages: [{ role: "user", content: prompt }],
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
};

// ─── Generate short label from conversation messages ──────────────────────────
const generateLabel = async (conversationId) => {
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    if (!messages.length) return;

    const transcript = messages
        .map(m => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`)
        .join("\n");

    const label = await callLLM(
        `Summarize what this conversation is about in 5 words or less. Reply with only the label, no punctuation.\n\n${transcript}`
    );

    await Conversation.findByIdAndUpdate(conversationId, { label });
};

// ─── Classify if conversation was resolved or unresolved ──────────────────────
const classifyResolution = async (conversationId) => {
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    if (!messages.length) return;

    const transcript = messages
        .map(m => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`)
        .join("\n");

    const result = await callLLM(
        `Based on this conversation, was the user's question or issue resolved by the bot? Reply with only "resolved" or "unresolved".\n\n${transcript}`
    );

    const isResolved = result.toLowerCase().includes("resolved");
    await Conversation.findByIdAndUpdate(conversationId, { isResolved });
};

// ─── Process all newly ended conversations ────────────────────────────────────
const processEndedConversations = async (endedIds) => {
    for (const id of endedIds) {
        try {
            await Promise.all([
                generateLabel(id),
                classifyResolution(id),
            ]);
        } catch (err) {
            // Don't crash the job if one conversation fails
            console.error(`Failed to process conversation ${id}:`, err.message);
        }
    }
};

// ─── Cleanup job — runs every 5 mins ────────────────────────────────────────
const startCleanupJob = () => {
    cron.schedule("*/5 * * * *", async () => {
        console.log("🧹 Running MarkEnd job...");
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Find stale conversations before ending them so we have their ids
        const stale = await Conversation.find({
            endedAt: null,
            lastMessageAt: { $lt: fiveMinsAgo },
        }).select("_id");

        if (!stale.length) return;

        const staleIds = stale.map(c => c._id);

        // End them all
        await Conversation.updateMany(
            { _id: { $in: staleIds } },
            { endedAt: new Date() }
        );

        // Generate label and classify each one
        await processEndedConversations(staleIds);
    });
};

module.exports = startCleanupJob;