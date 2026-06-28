const express = require("express");
const stripeControllers = require("../controllers/stripe.controller.js")
const router = express.Router();


router.post("/checkout", stripeControllers.createCheckoutSession);

router.get("/verify-session/:sessionId", stripeControllers.verifyCheckoutSession);

module.exports = router;