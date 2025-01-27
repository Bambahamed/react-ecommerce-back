const User = require("../models/user");
const Order = require("../models/order");

//orders, orderStatus

exports.orders = async (req, res) => {
  let orders = await Order.find({})
    .sort("-createAt")
    .populate("products.product")
    .exec();

  res.json(orders);
};

exports.orderStatus = async (req, res) => {
  const { orderId, orderStatus } = req.body;

  let updated = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus },
    { new: true }
  ).exec();

  res.json(updated);
};
