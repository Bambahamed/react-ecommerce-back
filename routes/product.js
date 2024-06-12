const express = require("express");
const router = express.Router();

//middlewares
const { adminCheck, authCheck, auth } = require("../middlewares/auth");

//controllers
const {
  create,
  listAll,
  remove,
  read,
  update,
  list,
  productsCount,
  productStar,
  listRelated,
  searchFilters,
} = require("../controllers/product");

//route
router.post("/product", adminCheck, create);
router.get("/products/total", productsCount);
router.get("/products/:count", listAll);
router.delete("/product/:slug", adminCheck, remove);
router.get("/product/:slug", read);
router.put("/product/:slug", adminCheck, update);
router.post("/products", list);

//Rating
router.put("/product/star/:productId", auth, productStar);

//Related
router.get("/products/related/:productId", listRelated);

//search
router.post("/search/filters", searchFilters);

module.exports = router;
