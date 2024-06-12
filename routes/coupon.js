const express = require("express");
const router = express.Router();

//middlewares
const { auth, adminCheck } = require("../middlewares/auth");

//controllers
const { create, remove, list } = require("../controllers/coupon");

//route
router.post("/coupon", adminCheck, create);
router.get("/coupons", list);
router.delete("/coupon/:couponId", adminCheck, remove);

module.exports = router;
