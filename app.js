require("rootpath")();
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("api/v1/_middleware/error-handler");
const { requireSignin } = require("./api/v1/_middleware/auth");
// set the view engine to ejs
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

// web routes
app.get("/", function (req, res) {
  res.render("pages/index");
});

app.get("/registration", function (req, res) {
  res.render("pages/registration");
});

app.get("/home", function (req, res) {
  res.render("pages/home");
});

// api routes
app.use("/api/user", require("./api/v1/users/users.controller"));

// global error handler
app.use(errorHandler);

// start server
const port =
  process.env.NODE_ENV === "production" ? process.env.PORT || 80 : 4000;
app.listen(port, () => console.log("Server listening on port " + port));
