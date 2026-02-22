import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const model = "gemini-2.5-flash";
// const model = "gemini-3-pro-preview";

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "log> FATAL ERROR: GEMINI_API_KEY is not set in the environment variables."
  );
  process.exit(1);
}

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `
    Generate exactly ${count} educational flashcards from the following text.
    STRICT Format each flashcard as:
    Q: [clear, specific question]
    A: [concise, accurate answer]
    D: [Difficulty level: easy, medium, or hard]

    Separate each flashcard with "---"

    Text:
    ${text.substring(0, 15000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const generatedText = response.text;

    // Parse the response
    const flashcards = [];
    const cards = generatedText.split("---").filter((card) => card.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "",
        answer = "",
        difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim(); // Op of substring(2): " What is React?".trim()
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("log> ERROR Gemini API Error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numOfQuestions = 5) => {
  const prompt = `
    Generate exactly ${numOfQuestions} multiple choice questions from the following text.
    STRICT Format each question as:
    Q: [Question]
    O1: [Option 1]
    O2: [Option 2]
    O3: [Option 3]
    O4: [Option 4]
    C: [Correct option - exactly as written above]
    E: [Brief explanation]
    D: [Difficulty: easy, medium, or hard]

    Separate questions with "---"

    Text:
    ${text.substring(0, 15000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const generatedText = response.text;

    const mcqs = [];
    const mcqBlocks = generatedText
      .split("---")
      .filter((mcqBlock) => mcqBlock.trim());

    for (const mcqBlock of mcqBlocks) {
      const lines = mcqBlock.trim().split("\n");
      let question = "",
        options = [],
        correctAnswer = "",
        explanation = "",
        difficulty = "medium";

      for (let line of lines) {
        line = line.trim();
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.match(/^O\d+:/)) {
          // O1: or O10: or O100: ...
          options.push(line.replace(/^O\d+:/, "").trim());
        } else if (line.startsWith("C:")) {
          correctAnswer = line.substring(2).trim();
        } else if (line.startsWith("E:")) {
          explanation = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        mcqs.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return mcqs.slice(0, numOfQuestions);
  } catch (error) {
    console.error("log> ERROR Gemini API Error:", error);
    throw new Error("Failed to generate quiz");
  }
};

/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
  const prompt = `
    Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points.
    Keep the summary clear and structured.

    Text:
    ${text.substring(0, 20000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("log> ERROR Gemini API Error:", error);
    throw new Error("Failed to generate summary");
  }
};

/**
 * Chat with document context
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((chunk, index) => `[Chunk ${index + 1}]\n${chunk.content}`)
    .join("\n\n");

  const prompt = `
    Based on the following context from a document, analyse the context and answer the user's question.
    If the answer is not in the context, say so.

    Context:
    ${context}

    Question: ${question}

    Answer:
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("log> ERROR Gemini API Error:", error);
    throw new Error("Failed to process chat request");
  }
};

/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
  const prompt = `
    Explain the concept of "${concept}" based on the following context.
    Provide a clear, educational explanation that's easy to understand.
    Include examples if relevant.

    Context:
    ${context.substring(0, 10000)}
 `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("log> ERROR Gemini API Error:", error);
    throw new Error("Failed to explain concept");
  }
};
