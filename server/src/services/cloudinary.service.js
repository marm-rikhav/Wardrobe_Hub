import cloudinary from "../config/cloudinary.js";
import { ApiError } from "../utils/apiError.js";

/**
 * Upload an image buffer directly to Cloudinary using upload_stream
 * @param {Buffer} fileBuffer - File buffer from multer memory storage
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<{ secureUrl: string, publicId: string }>}
 */
export const uploadImageStream = (fileBuffer, folder = "wardrobe-hub/products") => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      return reject(new ApiError(400, "Invalid image file provided"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new ApiError(500, "Failed to upload image to Cloudinary", [], error)
          );
        }

        return resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete an image from Cloudinary by public ID
 * @param {string} publicId - Cloudinary asset public ID
 */
export const deleteImage = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`[Cloudinary] Failed to delete image ${publicId}:`, err);
    return null;
  }
};

export default {
  uploadImageStream,
  deleteImage,
};
