import Document from "../models/document.model.js";
import Flashcard from "../models/flashcard.model.js";
import Quiz from "../models/quiz.model.js";

/**
 * @desc    Get user learning statistics
 * @route   GET /api/progress/dashboard
 * @access  Private
 */
export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get counts
    const totalNumOfDocuments = await Document.countDocuments({ userId });
    const totalNumOfFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalNumOfQuizzes = await Quiz.countDocuments({ userId });
    const completedQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null },
    });

    // Get flashcard statistics
    const flashcardSets = await Flashcard.find({ userId });
    let totalNumOfFlashcards = 0; // OR totalNumOfCards
    let reviewedFlashcards = 0; // OR reviewedCards
    let starredFlashcards = 0; // OR starredCards

    flashcardSets.forEach((fcSet) => {
      totalNumOfFlashcards += fcSet.cards.length;
      reviewedFlashcards += fcSet.cards.filter(
        (card) => card.reviewCount > 0
      ).length;
      starredFlashcards += fcSet.cards.filter(
        (card) => card.isStarred === true
      ).length;
    });

    // Get quiz statistics
    const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
    const averageScore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / quizzes.length
          )
        : 0;

    // Recent activity
    const recentDocuments = await Document.find({ userId })
      .sort({ lastAccessed: -1 }) // LAFS
      .limit(5)
      .select("title fileName lastAccessed status");

    const recentQuizzes = await Quiz.find({ userId })
      .sort({ createdAt: -1 }) // LIFS
      .limit(5)
      .populate("documentId", "title")
      .select("title score totalNumOfMCQs completedAt");

    // Study streak (simplified - in production, track daily activity)
    const studyStreak = Math.floor(Math.random() * 7) + 1; // Mock data

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalNumOfDocuments,
          totalNumOfFlashcardSets,
          totalNumOfFlashcards,
          reviewedFlashcards,
          starredFlashcards,
          totalNumOfQuizzes,
          completedQuizzes,
          averageScore,
          studyStreak,
        },
        recentActivity: {
          documents: recentDocuments,
          quizzes: recentQuizzes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
