import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @description Uploads a file buffer directly to Cloudinary (Serverless Compatible)
 * @param {Buffer} fileBuffer - The file data from req.file.buffer
 */
const uploadOnCloudinary = async (fileBuffer) => {
  if (!fileBuffer) {
    throw new Error("No file buffer provided for upload.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "veloxdoc-ai",
      },
      (error, result) => {
        if (error) {
          console.error("log> Cloudinary Upload Error:", error);
          return reject(
            new Error(`Cloudinary upload failed: ${error.message}`)
          );
        }
        console.log(
          "log> File uploaded to Cloudinary successfully:",
          result.secure_url
        );
        resolve(result);
      }
    );

    // Write the buffer to the stream
    uploadStream.end(fileBuffer);
  });
};

/**
 * @description Deletes an image from Cloudinary using its Public ID
 * @param {string} imageUrl - The full URL of the image to delete
 */
const deleteFromCloudinary = async (fileUrl) => {
  if (!fileUrl) {
    throw new Error("No fileUrl provided for delete.");
  }

  try {
    let fileUrlArray = fileUrl.split("/");
    let fileName = fileUrlArray[fileUrlArray.length - 1]; // "tklrxe042qhb5kmu1n9n.pdf"
    const filePublicId = fileName.split(".")[0]; // "tklrxe042qhb5kmu1n9n"
    console.log("filePublicId:", filePublicId);

    if (!filePublicId) {
      throw new Error("Could not extract public filePublicId from URL");
    }

    const response = await cloudinary.uploader.destroy(
      `veloxdoc-ai/${filePublicId}`
    );
    console.log("log> Cloudinary image deleted:", response);

    return response;
  } catch (err) {
    console.error("log> Cloudinary Delete Error:", err.message);
    throw new Error(`Failed to delete image: ${err.message}`);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
