import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

import axios from "axios";
import fs from "fs/promises";

/**
 * Extract text from PDF buffer, URL, or local path
 * @param {Buffer|string} input - PDF file buffer or URL/Path
 */
export const extractTextFromPDF = async (input) => {
  try {
    let dataBuffer;

    if (Buffer.isBuffer(input)) {
      dataBuffer = input;
    } else if (typeof input === "string" && input.startsWith("http")) {
      // Download from Cloudinary
      const response = await axios.get(input, { responseType: "arraybuffer" });
      dataBuffer = Buffer.from(response.data);
    } else {
      // Local file fallback
      dataBuffer = await fs.readFile(input);
    }

    // Pure JS extraction - no DOMMatrix or canvas required
    const data = await pdf(dataBuffer);

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.error("log> ERROR PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};
