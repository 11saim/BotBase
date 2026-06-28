const stripe = require("../lib/stripe");
const User = require("../models/User");
const Usage = require("../models/Usage");

const createCheckoutSession = async (req, res) => {
    try {
        const { priceId } = req.body;

        if (!priceId) {
            return res.status(400).json({
                success: false,
                message: "Price ID is required.",
            });
        }

        // req.user comes from your protect middleware
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Create Stripe Customer only once
        if (!user.stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.fullName || undefined,
                metadata: {
                    userId: user._id.toString(),
                },
            });

            user.stripeCustomerId = customer.id;
            await user.save();
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: user.stripeCustomerId,

            mode: "subscription",

            payment_method_types: ["card"],

            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],

            success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,

            cancel_url: `${process.env.CLIENT_URL}/pricing`,

            metadata: {
                userId: user._id.toString(),
                plan: req.body.plan
            },
        });

        return res.status(200).json({
            success: true,
            url: session.url,
        });
    } catch (error) {
        next(error);
    }
};

const verifyCheckoutSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (
            session.payment_status === "paid" &&
            session.metadata.userId === req.user.id
        ) {
            return res.json({ success: true, plan: session.metadata.plan });
        }

        return res.json({ success: false });
    } catch (error) {
        return res.json({ success: false });
    }
};

module.exports = {
    createCheckoutSession,
    verifyCheckoutSession
}
