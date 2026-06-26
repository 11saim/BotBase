const stripe = require("../lib/stripe");
const User = require("../models/User");

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

            success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,

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

const createPortalSession = async (req, res) => { };

const webhookHandler = async (req, res) => {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            // ==========================================
            // Checkout completed (first successful payment)
            // ==========================================
            case "checkout.session.completed": {
                const session = event.data.object;

                if (session.mode !== "subscription") break;

                const subscription = await stripe.subscriptions.retrieve(
                    session.subscription
                );

                const periodEnd =
                    subscription.items.data[0].current_period_end;

                const updatedUser = await User.findByIdAndUpdate(
                    session.metadata.userId,
                    {
                        plan: session.metadata.plan.toLowerCase(),
                        stripeSubscriptionId: subscription.id,
                        subscriptionStatus: "active",
                        planExpiresAt: new Date(periodEnd * 1000),
                    },
                    { new: true }
                );

                break;
            }

            // ==========================================
            // Subscription renewed / updated
            // ==========================================
            case "customer.subscription.updated": {
                const subscription = event.data.object;

                const periodEnd =
                    subscription.items.data[0].current_period_end;

                await User.findOneAndUpdate(
                    {
                        stripeSubscriptionId: subscription.id,
                    },
                    {
                        subscriptionStatus:
                            subscription.status === "active"
                                ? "active"
                                : "inactive",

                        planExpiresAt: new Date(periodEnd * 1000),
                    }
                );

                break;
            }

            // ==========================================
            // Subscription cancelled / expired
            // ==========================================
            case "customer.subscription.deleted": {
                const subscription = event.data.object;

                await User.findOneAndUpdate(
                    {
                        stripeSubscriptionId: subscription.id,
                    },
                    {
                        plan: "free",
                        stripeSubscriptionId: null,
                        subscriptionStatus: "inactive",
                        planExpiresAt: null,
                    }
                );

                break;
            }

            default:
        }

        return res.json({ received: true });
    } catch (error) {

        return res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createCheckoutSession,
    createPortalSession,
    webhookHandler
}
