// imports
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";

// custom imports
import connectDb from "./config/dbConn";
import { corsOption } from "./config/corsOption";
import credentials from "./middlewares/credentials.middleware";
import blogRouter from "./routes/blogs.route";
import reviewRouter from "./routes/review.route";

// dotenv configuration
dotenv.config();

// port
const PORT = process.env.PORT || 5000;

// app
const app = express();

// database connection initialization
connectDb();

// cors option
app.use(credentials);
app.use(cors(corsOption));

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
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/review", reviewRouter);

// server
mongoose.connection.once("open", () => {
  console.log("Connected to Mongo DB");
  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
});
