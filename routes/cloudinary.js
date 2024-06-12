const express = require("express");
const router = express.Router();

//middlewares

const { adminCheck } = require("../middlewares/auth");

//controllers

const { upload, remove } = require("../controllers/cloudinary");

router.post("/uploadimages", adminCheck, upload);
router.post("/removeimages", adminCheck, remove);

module.exports = router;
