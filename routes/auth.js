const express = require("express");
const router = express.Router();
const User = require("../models/user");

//middlewares
const { adminCheck } = require("../middlewares/auth");

//controllers
const { createOrUpdateUser, currentUser } = require("../controllers/auth");

const myMiddleware = (req, res, next) => {
  console.log("IM A MIDDLEWARE YAY");
  next();
};
router.post("/create-or-update-user", createOrUpdateUser);
router.post("/current-user", currentUser);
router.post("/current-admin", currentUser, adminCheck);

module.exports = router;
