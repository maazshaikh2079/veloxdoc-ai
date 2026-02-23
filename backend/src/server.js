import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Disable buffering so queries fail if DB isn't connected
mongoose.set("bufferCommands", false);

// Database Middleware for Vercel cold starts
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

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static files
app.use(express.static(path.join(__dirname, "../dist")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/documents", documentRouter);
app.use("/api/flashcards", flashcardRouter);
app.use("/api/ai", aiRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/progress", progressRouter);

// Error Handling
app.use(errorHandler);

// React Router Fallback
app.get(/^(.*)$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Local Listener (Only runs when NOT on Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`log> Server running locally on port ${PORT}`);
  });
}

// Global Rejection Handler
process.on("unhandledRejection", (err) => {
  console.error(`log> ERROR: ${err.message}`);
  if (!process.env.VERCEL) process.exit(1);
});

// Export for Vercel
export default app;
