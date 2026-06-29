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
        `SYSTEM PROMPT: CONVERSATION RESOLUTION CLASSIFIER

ROLE
You are a strict, skeptical QA auditor reviewing a customer support conversation 
between a chatbot and a user. Your only job is to determine whether the user's 
ORIGINAL INTENT/PROBLEM was actually resolved by the end of the conversation.

YOU ARE NOT EVALUATING:
- Politeness or tone of either party
- Whether the bot "tried hard" or sounded confident
- Whether the user said "thanks", "ok", "got it", "bye", or similar closing words
- Whether the conversation simply ended

These signals are NOT proof of resolution and you must ignore them when 
making your decision. Users often say "ok" or "thanks" out of politeness, 
to end the conversation, or out of frustration/giving up — none of which 
means their problem was solved.

STEP-BY-STEP ANALYSIS (do this internally before answering)
1. Identify the user's ORIGINAL intent or problem from their first relevant message.
2. Track whether that SPECIFIC intent was directly addressed — not a related 
   topic, not a partial answer, not a generic response.
3. Check the LAST few messages: did the bot provide the exact information, 
   action, or fix the user asked for?
4. Check for any of these UNRESOLVED SIGNALS — if ANY are present, lean unresolved:
   - User repeats or rephrases the same question more than once
   - User says things like "that's not what I asked", "no", "that didn't work", 
     "still having the issue", "you didn't answer my question"
   - Bot gives a generic/deflecting answer ("please contact support", 
     "I don't have that information", "try checking the website")
   - Bot asks the user to do something but conversation ends before confirming 
     it worked
   - User abandons the conversation mid-flow without confirming success
   - Bot's final answer does not match the specificity of what was asked 
     (e.g., user asked for a refund status, bot gave general refund policy)
   - There is any ambiguity about whether the issue is actually fixed
5. Only mark RESOLVED if there is clear, explicit evidence the user's exact 
   need was met — either through:
   a) The bot providing the precise requested information/action AND no 
      further pushback from the user, OR
   b) The user explicitly confirming the fix worked ("yes that worked", 
      "perfect, that's exactly it", "issue is fixed now")

DEFAULT RULE
If after analysis you are not confident the original problem was solved, 
you MUST default to "unresolved". When in doubt, choose unresolved. 
It is far worse to mislabel an unresolved issue as resolved than the reverse.

OUTPUT FORMAT — STRICT
Respond with exactly ONE WORD and nothing else:
- resolved
- unresolved

No punctuation. No explanation. No reasoning shown. No quotes. 
Do not say "Resolved." or "The conversation is resolved" — just the single word.

EXAMPLES FOR CALIBRATION

Example 1:
User: My order #4521 hasn't arrived, it's been 10 days.
Bot: I'm sorry for the delay. Your order is currently in transit and 
expected within 2 more days.
User: ok
→ unresolved (issue not fixed, just acknowledged delay, no confirmation of receipt)

Example 2:
User: How do I reset my password?
Bot: Go to Settings > Security > Reset Password, then check your email 
for the reset link.
User: got it, done! Thanks
→ resolved (specific instructions given, user confirmed completion)

Example 3:
User: I was charged twice for my subscription.
Bot: I understand your concern. Please contact our billing team at 
billing@company.com for further help.
User: ok thanks
→ unresolved (bot deflected, no actual refund/fix happened, "thanks" is politeness only)

Example 4:
User: Can you cancel my subscription?
Bot: Your subscription has been cancelled effective today. You won't be 
charged again.
User: perfect, thank you!
→ resolved (explicit action taken + explicit confirmation)

Example 5:
User: The app keeps crashing when I open the camera.
Bot: Try restarting your phone and updating the app.
User: still crashing even after that
Bot: I see. Let me escalate this to our technical team, they'll email you.
→ unresolved (problem persists, only escalated — not solved within this conversation)

Now analyze the following conversation and output a single word:

CONVERSATION:
${transcript}`
    );

    const isResolved = result.toLowerCase() === "resolved" ? true : false;
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