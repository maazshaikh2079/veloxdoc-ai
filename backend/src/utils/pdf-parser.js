import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * Extract text from PDF buffer
 * @param {buffer} input - PDF file buffer input
 */
export const extractTextFromPDF = async (input) => {
  try {
    let dataBuffer;

    if (Buffer.isBuffer(input)) {
      dataBuffer = input;
    } else if (typeof input === "string" && input.startsWith("http")) {
      const response = await axios.get(input, { responseType: "arraybuffer" });
      dataBuffer = Buffer.from(response.data);
    } else {
      dataBuffer = await fs.readFile(input);
    }

    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await parser.getText();

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
