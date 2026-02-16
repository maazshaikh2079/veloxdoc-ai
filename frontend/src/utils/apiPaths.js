export const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },

  DOCUMENTS: {
    UPLOAD_DOCUMENT: "/api/documents/upload",
    GET_DOCUMENTS: "/api/documents",
    GET_DOCUMENT_BY_ID: (documentId) => `/api/documents/${documentId}`,
    // UPDATE_DOCUMENT: (documentId) => `/api/documents/${documentId}`,
    DELETE_DOCUMENT: (documentId) => `/api/documents/${documentId}`,
  },

  AI: {
    GENERATE_FLASHCARDS: "/api/ai/generate-flashcards",
    GENERATE_QUIZ: "/api/ai/generate-quiz",
    GENERATE_SUMMARY: "/api/ai/generate-summary",
    CHAT: "/api/ai/chat",
    EXPLAIN_CONCEPT: "/api/ai/explain-concept",
    GET_CHAT_HISTORY: (documentId) => `/api/ai/chat-history/${documentId}`,
  },

  FLASHCARDS: {
    GET_ALL_FLASHCARD_SETS: "/api/flashcards",
    GET_FLASHCARDS_FOR_DOC: (documentId) => `/api/flashcards/${documentId}`,
    REVIEW_FLASHCARD: (cardId) => `/api/flashcards/${cardId}/review`,
    TOGGLE_STAR: (cardId) => `/api/flashcards/${cardId}/star`,
    DELETE_FLASHCARD_SET: (cardId) => `/api/flashcards/${cardId}`,
  },

  QUIZZES: {
    GET_QUIZZES_FOR_DOC: (documentId) => `/api/quizzes/${documentId}`,
    GET_QUIZ_BY_ID: (quizId) => `/api/quizzes/quiz/${quizId}`,
    SUBMIT_QUIZ: (quizId) => `/api/quizzes/${quizId}/submit`,
    GET_QUIZ_RESULTS: (quizId) => `/api/quizzes/${quizId}/results`,
    DELETE_QUIZ: (quizId) => `/api/quizzes/${quizId}`,
  },

  PROGRESS: {
    GET_DASHBOARD_DATA: "/api/progress/dashboard",
  },
};
