const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Coupon = require("../models/coupon");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { couponApplied } = req.body;
    // 1 find user
    const user = await User.findOne({ email: req.user.email }).exec();

    // 2 get user cart total

    const { cartTotal, totalAfterDiscount } = await Cart.findOne({
      orderBy: user._id,
    }).exec();

    console.log(
      "CART TOTAL CHARGED",
      cartTotal,
      "AFTER DIS%",
      totalAfterDiscount
    );
    let finalAmount = 0;

    if (couponApplied && totalAfterDiscount) {
      finalAmount = Math.round(totalAfterDiscount * 100);
    } else {
      finalAmount = Math.round(cartTotal * 100);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount, // Remplacez par le montant calculé
      currency: "usd",
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
      cartTotal,
      totalAfterDiscount,
      payable: finalAmount,
    });
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
};
