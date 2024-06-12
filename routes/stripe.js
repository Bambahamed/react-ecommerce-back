const express = require("express");
const router = express.Router();

const { createPaymentIntent } = require("../controllers/stripe");
const { route } = require("./user");

//middleware

const { auth } = require("../middlewares/auth");

router.post("/create-payment-intent", auth, createPaymentIntent);

module.exports = router;
