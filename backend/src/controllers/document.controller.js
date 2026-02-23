import mongoose from "mongoose";
import fs from "fs/promises";

import Document from "../models/document.model.js";
import ChatHistory from "../models/chathistory.model.js";
import Flashcard from "../models/flashcard.model.js";
import Quiz from "../models/quiz.model.js";
import { extractTextFromPDF } from "../utils/pdf-parser.js";
import { chunkText } from "../utils/text-chunker.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }

    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    // Upload the file to Cloudinary
    const cloudinaryResult = await uploadOnCloudinary(req.file.buffer);
    const fileUrl = cloudinaryResult.secure_url;

    // Create document record
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl,
      fileSize: req.file.size,
      status: "processing",
    });

    // Process PDF in background
    processPDF(document._id, req.file.buffer).catch((err) => {
      console.error("log> ERROR PDF processing error:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing in progress...",
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to process PDF
const processPDF = async (documentId, fileSource) => {
  try {
    const { text } = await extractTextFromPDF(fileSource);

    // Create chunks
    const chunks = chunkText(text, 500, 50);

    // Update document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });

    console.log(`log> Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`log> ERROR Error process document ${documentId}:`, error);

    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: "flashcards", // Go to the 'flashcards' collection
          localField: "_id", // Take the document's ID
          foreignField: "documentId", // Find flashcards where 'documentId' matches
          as: "flashcardSets", // Put results in an array called 'flashcardSets'
        },
      },
      {
        $lookup: {
          from: "quizzes", // Go to the 'quizzes' collection
          localField: "_id", // Take the document's ID
          foreignField: "documentId", // Find quizzes where 'documentId' matches
          as: "quizzes", // Put results in an array called 'quizzes'
        },
      },
      {
        $addFields: {
          // Calculate the count by getting the size of the 'flashcardSets' array created in the previous lookup
          flashcardCount: { $size: "$flashcardSets" },
          // Calculate the count by getting the size of the 'quizzes' array created in the previous lookup
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          // 0 means "exclude this field"
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      {
        // Sorts the results so the newest uploads appear first (-1 is descending)
        $sort: { uploadDate: -1 }, // LIFA
      },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document with chunks
// @route   GET /api/documents/:documentId
// @access  Private
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.documentId,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    // Update the last accessed time in memory first
    document.lastAccessed = Date.now();

    // Run all database requests simultaneously
    const [flashcardCount, quizCount, _updatedDoc] = await Promise.all([
      Flashcard.countDocuments({ documentId: document._id }),
      Quiz.countDocuments({ documentId: document._id }),
      document.save(), // Save the 'lastAccessed' update
      // OR
      // Update access time (Fire and forget, or await if strict)
      // (async () => {
      //    document.lastAccessed = Date.now();
      //    await document.save();
      // })()
    ]);

    // Convert Mongoose document to a plain object so we can add custom fields
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:documentId
// @access  Private
export const deleteDocument = async (req, res, next) => {
  let session;
  const documentId = req.params.documentId;
  const userId = req.user._id;

  try {
    const document = await Document.findOne({
      _id: documentId,
      userId: userId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    await Promise.all([
      ChatHistory.deleteMany({ userId, documentId }, { session }),
      Flashcard.deleteMany({ userId, documentId }, { session }),
      Quiz.deleteMany({ userId, documentId }, { session }),
      document.deleteOne({ session }),
    ]);

    // Commit the DB changes first
    await session.commitTransaction();
    session.endSession();

    try {
      await deleteFromCloudinary(document.filePath);
    } catch (cloudinaryError) {
      console.error("log> Cloudinary cleanup failed:", cloudinaryError.message);
    }

    res.status(200).json({
      success: true, // Fixed spelling
      message: `Document deleted successfully`,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error("log> Delete Document Error:", error);
    next(error);
  }
};

// // @desc    Update document title
// // @route   PUT /api/documents/:documentId
// // @access  Private
// export const updateDocument = async (req, res, next) => {
//   try {
//   } catch (error) {
//     next(error);
//   }
// };
