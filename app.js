import express from "express";
const app = express();
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/errors.js";
import path from "path";
import axios from "axios";
import cheerio from "cheerio"
import cors from'cors'

// import { fileURLToPath } from "url"

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
app.use(cors());
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
app.use(express.static("backend/public"));
app.use(express.static("public"));
app.use(express.static("/public"));
// app.use(express.static("./public"))


// Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err}`);
  console.log("Shutting down due to uncaught expection");
  process.exit(1);
});


if (process.env.NODE_ENV !== "PRODUCTION")
  dotenv.config({ path: "./config/config.env" });
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
// import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js"
import proposalRoutes from './routes/proposal.js'
import messageRoutes from './routes/message.js'
// app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use('/api/v1', projectRoutes);
app.use("/api/v1",proposalRoutes)
app.use('/api/v1',messageRoutes)


// Using error middleware
app.use(errorMiddleware);

const server = app.listen(4000, () => {
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

