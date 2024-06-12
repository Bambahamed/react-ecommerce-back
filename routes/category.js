const express = require("express");
const router = express.Router();

//middlewares
const { adminCheck, authCheck } = require("../middlewares/auth");

//controllers
const {
  create,
  read,
  update,
  remove,
  list,
  getSubs,
} = require("../controllers/category");

//route
router.post("/category", adminCheck, create);
router.get("/categories", list);
router.get("/category/:slug", read);
router.put("/category/:slug", adminCheck, update);
router.delete("/category/:slug", adminCheck, remove);
router.get("/category/subs/:_id", getSubs);

module.exports = router;
