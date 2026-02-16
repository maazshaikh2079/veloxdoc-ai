import Quiz from "../models/quiz.model.js";

/**
 * @desc    Get all quizzes for a document
 * @routes  GET /api/quizzes/:documentId
 * @access  Private
 */
export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 }); // LIFA

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single quiz by quizId
 * @routes  GET /api/quizzes/quiz/:quizId
 * @access  Private
 */
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit quiz answers
 * @routes  POST /api/quizzes/:quizId/submit
 * @access  Private
 */
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    // console.log(answers);

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Please provide answers array",
        statusCode: 400,
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz already completed",
        statusCode: 400,
      });
    }

    // Process answer
    let correctCount = 0;
    const userAnswers = [];

    const clean = (str) =>
      str
        .toLowerCase()
        .replace(/^o\d+[:.]?/, "")
        .replace(/[^a-z0-9]/g, "");

    answers.forEach((answer) => {
      const { mcqIndex, selectedAnswer } = answer;

      if (mcqIndex < quiz.mcqs.length) {
        const mcq = quiz.mcqs[mcqIndex];
        const isCorrect = clean(selectedAnswer) === clean(mcq.correctAnswer);
        // console.log("clean(selectedAnswer): ", clean(selectedAnswer));
        // console.log("clean(mcq.correctAnswer): ", clean(mcq.correctAnswer));

        if (isCorrect) correctCount++;

        userAnswers.push({
          mcqIndex,
          selectedAnswer,
          isCorrect,
          answeredAt: new Date(),
        });
      }
    });

    // Calculate score(percentage)
    const score = Math.round((correctCount / quiz.totalNumOfMCQs) * 100);

    // Update quiz
    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        score,
        correctCount,
        totalNumOfMCQs: quiz.totalNumOfMCQs,
        percentage: score,
        userAnswers,
      },
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quiz results
 * @routes  GET /api/quizzes/:quizId/results
 * @access  Private
 */
export const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz not completed yet",
        statusCode: 400,
      });
    }

    // Build detailed results
    const detailedResults = quiz.mcqs.map((mcq, index) => {
      const userAnswer = quiz.userAnswers.find(
        (userAnswer) => userAnswer.mcqIndex === index
      );

      return {
        mcqIndex: index,
        question: mcq.question,
        options: mcq.options,
        correctAnswer: mcq.correctAnswer,
        selectedAnswer: userAnswer?.selectedAnswer || null,
        isCorrect: userAnswer?.isCorrect || false,
        explanation: mcq.explanation,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          document: quiz.documentId,
          totalNumOfMCQs: quiz.totalNumOfMCQs,
          attemptedMCQs: quiz.userAnswers.length,
          score: quiz.score,
          completedAt: quiz.completedAt,
        },
        result: detailedResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a quiz
 * @routes  DELETE /api/quizzes/:quizId
 * @access  Private
 */
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.quizId,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
