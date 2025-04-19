// imports
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// port
const port = process.env.port || 5000;

// app
const app = express();

// database connection initialization

// cors option

// cookie parser
app.use(cookieParser());

// url incoded
app.use(express.urlencoded({ extended: true }));

// built in middleware for json
app.use(express.json({ limit: "5mb" }));

// Serve Static Files
app.use("/public", express.static(path.join(__dirname, "../public")));
console.log("serving file from: ", path.join(__dirname, "../public"));

// routes

// server
app.listen(port, () => {
  console.log("Server running on port", port);
});
