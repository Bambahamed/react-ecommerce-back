const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const { readdirSync } = require("fs");
require("dotenv").config();

//import routes

//app
const app = express();

//db
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB CONNECTED"))
  .catch((error) => {
    console.log("DB CONNECTION ERR", error);
  });

// middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(cors());
app.options("*", cors());

//routes middlewares

readdirSync("./routes").map((r) => {
  app.use("/api", require("./routes/" + r));
});

//route

// port

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running port ${port}`));
