import express from "express";

import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
} from "../controllers/quiz.controller.js";
import protect from "../middlewares/check-auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/:documentId", getQuizzes);
router.get("/quiz/:quizId", getQuizById);
router.post("/:quizId/submit", submitQuiz);
router.get("/:quizId/results", getQuizResults);
router.delete("/:quizId", deleteQuiz);

export default router;
