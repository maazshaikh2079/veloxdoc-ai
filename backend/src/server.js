import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import errorHandler from "./middlewares/error-handler.js";

// Import Routes
import authRouter from "./routes/auth.routes.js";
import documentRouter from "./routes/document.routes.js";
import flashcardRouter from "./routes/flashcard.routes.js";
import aiRouter from "./routes/ai.routes.js";
import quizRouter from "./routes/quiz.routes.js";
import progressRouter from "./routes/progress.routes.js";

const app = express();

// Ignore favicon requests
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Disable buffering for Serverless cold starts
mongoose.set("bufferCommands", false);

// Database Connection Middleware
let isConnected = false;
app.use(async (req, res, next) => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return next();
  }
  try {
    await connectDB();
    isConnected = true;
    next();
  } catch (err) {
    res.status(503).json({
      success: false,
      error: "Database connection failed",
      message: err.message,
    });
  }
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/documents", documentRouter);
app.use("/api/flashcards", flashcardRouter);
app.use("/api/ai", aiRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/progress", progressRouter);

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({ status: "VeloxDoc AI API is running" });
});

// Error Handling
app.use(errorHandler);

// API 404 Handler 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "API Route not found",
    statusCode: 404,
  });
});

// Local Listener
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`log> API Server running locally on port ${PORT}`);
  });
}

// Global Rejection Handler
process.on("unhandledRejection", (err) => {
  console.error(`log> ERROR: ${err.message}`);
  if (!process.env.VERCEL) process.exit(1);
});

export default app;
