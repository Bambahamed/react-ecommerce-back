const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const uniqueid = require("uniqueid");

exports.userCart = async (req, res) => {
  const { cart } = req.body;

  let products = [];

  const user = await User.findOne({ email: req.user.email }).exec();

  //check if cart width logged in user id already exist

  let cartExistByThisUser = await Cart.findOne({ orderBy: user._id }).exec();

  if (cartExistByThisUser) {
    cartExistByThisUser.deleteOne();
    console.log("removed old cart");
  }
  for (let i = 0; i < cart.length; i++) {
    let object = {};
    object.product = cart[i]._id;
    object.count = cart[i].count;
    object.color = cart[i].color;
    //get price for creating total
    let productFromDb = await Product.findById(cart[i]._id)
      .select("price")
      .exec();
    object.price = productFromDb.price;

    products.push(object);
  }

  // console.log("products", products);

  let cartTotal = 0;

  for (let i = 0; i < products.length; i++) {
    cartTotal = cartTotal + products[i].price * products[i].count;
  }
  /* console.log("cartTotal", cartTotal); */
  let newCart = await new Cart({
    products,
    cartTotal,
    orderBy: user._id,
  }).save();

  console.log("new cart ------>", newCart);
  res.json({ ok: true });
};

exports.getUserCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();

  let cart = await Cart.findOne({ orderBy: user._id })
    .sort({ createdAt: -1 })
    .populate("products.product", "_id title price totalAfterDiscount")
    .exec();
  if (cart.length < 1) {
    return;
  } else {
    const { products, cartTotal, totalAfterDiscount } = cart;
    res.json({ products, cartTotal, totalAfterDiscount });
  }
};

exports.emptyCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();

  const cart = await Cart.findOneAndDelete({ orderBy: user._id }).exec();
  res.json(cart);
};

exports.saveAddress = async (req, res) => {
  const { email } = req.user;
  const userAddress = await User.findOneAndUpdate(
    { email },
    { address: req.body.address },
    { new: true }
  ).exec();

  res.json({ ok: true });
};

exports.applyCouponToUserCart = async (req, res) => {
  const { coupon } = req.body;
  console.log("COUPON", coupon);

  const validCoupon = await Coupon.findOne({ name: coupon }).exec();

  if (validCoupon === null) {
    return res.json({
      err: "Invalid coupon",
    });
  }
  console.log("VALID COUPON", validCoupon);

  const { email } = req.user;

  const user = await User.findOne({ email }).exec();

  let { products, cartTotal } = await Cart.findOne({
    orderBy: user._id,
  })
    .populate("products.product", "_id title price")
    .exec();

  console.log("cartTotal", cartTotal, "discount%", validCoupon.discount);

  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);

  Cart.findOneAndUpdate(
    { orderBy: user._id },
    { totalAfterDiscount },
    { new: true }
  ).exec();

  res.json(totalAfterDiscount);
};

exports.createOrder = async (req, res) => {
  const { paymentIntent } = req.body.stripeResponse;

  const user = await User.findOne({ email: req.user.email }).exec();

  let { products } = await Cart.findOne({ orderBy: user._id }).exec();

  let newOrder = await new Order({
    products,
    paymentIntent,
    orderBy: user._id,
  }).save();

  // decrement quantity, increment sold

  let bulkOption = products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product }, // important item.product
        update: {
          $inc: {
            quantity: -item.count,
            sold: +item.count,
          },
        },
      },
    };
  });

  let updated = await Product.bulkWrite(bulkOption, {});
  console.log("PRODUCT QUANTITY-- AND SOLD++ ", updated);

  console.log("NEW ORDER SAVED", newOrder);

  res.json({ ok: true });
};

exports.orders = async (req, res) => {
  let user = await User.findOne({ email: req.user.email }).exec();

  let userOrders = await Order.find({ orderBy: user._id })
    .populate("products.product")
    .exec();
  res.json(userOrders);
};

// addToWishlist wishlist removeFromWishlist

exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;

  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $addToSet: { wishlist: productId } }
  ).exec();

  res.json({ ok: true });
};

exports.wishlist = async (req, res) => {
  const list = await User.findOne({ email: req.user.email })
    .select("wishlist")
    .populate("wishlist")
    .exec();

  res.json(list);
};

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $pull: { wishlist: productId } }
  ).exec();

  res.json({ ok: true });
};

exports.createCashOrder = async (req, res) => {
  const { COD, couponApplied } = req.body;

  // if COD is true, create order with status of Cash On Delivery
  if (!COD) return res.status(400).send("Create cash order failed");

  const user = await User.findOne({ email: req.user.email }).exec();

  let userCart = await Cart.findOne({ orderBy: user._id }).exec();

  let finalAmount = 0;

  if (couponApplied && userCart.totalAfterDiscount) {
    finalAmount = userCart.totalAfterDiscount * 100;
  } else {
    finalAmount = userCart.cartTotal * 100;
  }

  let newOrder = await new Order({
    products: userCart.products,
    paymentIntent: {
      id: uniqueid(),
      amount: finalAmount,
      currency: "usd",
      status: "Cash On Delivery",
      created: Date.now(),
      payment_method_types: ["cash"],
    },
    orderBy: user._id,
    orderStatus: "Cash On Delivery",
  }).save();

  // decrement quantity, increment sold

  let bulkOption = userCart.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item.product }, // important item.product
        update: {
          $inc: {
            quantity: -item.count,
            sold: +item.count,
          },
        },
      },
    };
  });

  let updated = await Product.bulkWrite(bulkOption, {});
  console.log("PRODUCT QUANTITY-- AND SOLD++ ", updated);

  console.log("NEW ORDER SAVED", newOrder);

  res.json({ ok: true });
};
