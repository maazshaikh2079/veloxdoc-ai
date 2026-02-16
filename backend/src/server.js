import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";

import connectDB from "./config/db.js";
import errorHandler from "./middlewares/error-handler.js";

// ES6 module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Init express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware to handle CORS
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

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../dist")));

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import Route
import authRouter from "./routes/auth.routes.js";
import documentRouter from "./routes/document.routes.js";
import flashcardRouter from "./routes/flashcard.routes.js";
import aiRouter from "./routes/ai.routes.js";
import quizRouter from "./routes/quiz.routes.js";
import progessRouter from "./routes/progress.routes.js";

// Routes
app.use("/api/auth", authRouter);
app.use("/api/documents", documentRouter);
app.use("/api/flashcards", flashcardRouter);
app.use("/api/ai", aiRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/progress", progessRouter);

// Error Handling:-
app.use(errorHandler);

// React Router Fallback (It ensures that refreshing pages like /dashboard serves the React app)
app.get(/^(.*)$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// 404 handler (Optional, since the route above catches all GET requests)
app.use((_, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    statusCode: 404,
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(
    `log> Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

process.on("unhandledRejection", (err) => {
  console.error(`log> ERROR Error: ${err.message}`);
  process.exit(1);
});
