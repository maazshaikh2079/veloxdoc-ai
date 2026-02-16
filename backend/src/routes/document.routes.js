import express from "express";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  // updateDocument,
} from "../controllers/document.controller.js";
import protect from "../middlewares/check-auth.js";
import fileUpload from "../config/multer.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.post("/upload", fileUpload.single("file"), uploadDocument);
// Warning: UnknownErrorException: Ensure that the `standardFontDataUrl` API parameter is provided.
// Warning: UnknownErrorException: Ensure that the `standardFontDataUrl` API parameter is provided.
// Warning: UnknownErrorException: Ensure that the `standardFontDataUrl` API parameter is provided.
router.get("/", getDocuments);
router.get("/:documentId", getDocument);
router.delete("/:documentId", deleteDocument);
// router.put("/:documentId", updateDocument);

export default router;
