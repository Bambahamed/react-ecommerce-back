const express = require("express");

const router = express.Router();

// middleWares

const { auth, adminCheck } = require("../middlewares/auth");

const { orders, orderStatus } = require("../controllers/admin");

// routes

router.get("/admin/orders", adminCheck, orders);
router.put("/admin/order-status", adminCheck, orderStatus);

module.exports = router;
