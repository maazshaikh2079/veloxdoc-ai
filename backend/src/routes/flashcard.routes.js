import express from "express";
import {
  getFlashcardSets,
  getAllFlashcardSets,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
} from "../controllers/flashcard.controller.js";
import protect from "../middlewares/check-auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllFlashcardSets);
router.get("/:documentId", getFlashcardSets);
router.post("/:cardId/review", reviewFlashcard);
router.put("/:cardId/star", toggleStarFlashcard);
router.delete("/:cardId", deleteFlashcardSet);

export default router;
