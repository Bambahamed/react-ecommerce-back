const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth");
const {
  userCart,
  getUserCart,
  emptyCart,
  saveAddress,
  applyCouponToUserCart,
  createOrder,
  orders,
  addToWishlist,
  wishlist,
  removeFromWishlist,
  createCashOrder,
} = require("../controllers/user");

router.post("/user/cart", auth, userCart); //save cart
router.get("/user/cart", auth, getUserCart);
router.delete("/user/cart", auth, emptyCart);
router.post("/user/address", auth, saveAddress);

// order
router.post("/user/order", auth, createOrder);
router.post("/user/cash-order", auth, createCashOrder);
router.get("/user/orders", auth, orders);
//coupon
router.post("/user/cart/coupon", auth, applyCouponToUserCart);

// wishlist

router.post("/user/wishlist", auth, addToWishlist);
router.get("/user/wishlist", auth, wishlist);
router.put("/user/wishlist/:productId", auth, removeFromWishlist);

// router.get("/user", (req, res) => {
//   res.json({
//     data: "hey you hit user API endpoint",
//   });
// });

module.exports = router;
