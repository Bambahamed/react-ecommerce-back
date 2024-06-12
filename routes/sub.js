const express = require("express");
const router = express.Router();

//middlewares
const { adminCheck } = require("../middlewares/auth");

//controllers
const { create, read, update, remove, list } = require("../controllers/sub");

//route
router.post("/sub", adminCheck, create);
router.get("/subs", list);
router.get("/sub/:slug", read);
router.put("/sub/:slug", adminCheck, update);
router.delete("/sub/:slug", adminCheck, remove);

module.exports = router;
