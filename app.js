import express from "express";
const app = express();
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/errors.js";
import path from "path";
import axios from "axios";
import cheerio from "cheerio"
import Currency from "./models/currency.js";
// import { fileURLToPath } from "url"

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
app.use(express.static("backend/public"));
// app.use(express.static("./public"))


// Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err}`);
  console.log("Shutting down due to uncaught expection");
  process.exit(1);
});


if (process.env.NODE_ENV !== "PRODUCTION")
  dotenv.config({ path: "backend/config/config.env" });
// Connecting to database
connectDatabase();

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(cookieParser());

// Import all routes
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
import userActivityRoutes from './routes/userActivity.js'
import ratingRoutes from './routes/rating.js'
import currency from "./models/currency.js";

app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", paymentRoutes);
app.use("/api/v1", userActivityRoutes);
app.use("/api/v1", ratingRoutes);

// if (process.env.NODE_ENV === "PRODUCTION") {
//   app.use(express.static(path.join(__dirname, "../frontend/build")));

  // app.get('*', (req, res) => {
  //   res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"))
  // })

app.get("/test", (req, res) => {
  res.send("API is running successfully");
});

// Using error middleware
app.use(errorMiddleware);

const server = app.listen(10000, () => {
  console.log(
    `Server started on PORT:10000  mode.`
  );
});

//Handle Unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err}`);
  console.log("Shutting down server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});

