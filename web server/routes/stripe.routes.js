const express = require("express");
const stripeControllers = require("../controllers/stripe.controller.js")
const { protect } = require("../middlewares/auth.js")
const router = express.Router();


router.post("/checkout", protect, stripeControllers.createCheckoutSession);

router.post("/portal", protect, stripeControllers.createPortalSession);

router.post("/webhook", stripeControllers.webhookHandler);

module.exports = router;