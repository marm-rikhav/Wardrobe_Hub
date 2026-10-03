import sizeOf from "image-size";
import { ApiError } from "./apiError.js";

/**
 * Validates an image buffer for file size, supported format, and 4:5 aspect ratio.
 *
 * Requirements:
 * 1. File size: 150 KB to 300 KB (153,600 to 307,200 bytes)
 * 2. Supported formats: JPG, JPEG, PNG, WebP only
 * 3. Recommended dimensions: 1200 x 1500 px or 800 x 1000 px with 4:5 aspect ratio (0.80)
 *    - Allows reasonable dimension variations with tolerance [0.75, 0.85]
 *
 * @param {Buffer} buffer - Image file buffer from multer memory storage
 * @returns {{ width: number, height: number, type: string }} Dimensions and format type
 */
export const validateImageBuffer = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new ApiError(400, "Invalid image data provided");
  }

  // 1. File size requirement: between 150 KB and 300 KB
  const MIN_FILE_SIZE = 150 * 1024; // 150 KB
  const MAX_FILE_SIZE = 300 * 1024; // 300 KB

  if (buffer.length < MIN_FILE_SIZE) {
    const sizeKb = (buffer.length / 1024).toFixed(1);
    throw new ApiError(
      400,
      `Image size is too small (${sizeKb} KB). The image size must be between 150 KB and 300 KB.`
    );
  }

  if (buffer.length > MAX_FILE_SIZE) {
    const sizeKb = (buffer.length / 1024).toFixed(1);
    throw new ApiError(
      400,
      `Image size exceeds the 300 KB limit (${sizeKb} KB). The image size must be between 150 KB and 300 KB.`
    );
  }

  // 2. Inspect image headers for dimensions and format
  let dimensions;
  try {
    dimensions = sizeOf(buffer);
  } catch (err) {
    throw new ApiError(
      400,
      "Unsupported file format or corrupted image. Only JPG, JPEG, PNG, and WebP images are allowed.",
      [],
      err
    );
  }

  if (!dimensions?.width || !dimensions?.height) {
    throw new ApiError(400, "Could not determine image dimensions.");
  }

  // 3. Supported formats: only JPG, PNG, and WebP allowed
  const allowedTypes = ["jpg", "png", "webp"];
  const type = dimensions.type?.toLowerCase();
  if (!type || !allowedTypes.includes(type)) {
    throw new ApiError(
      400,
      "Unsupported file format. Only JPG, JPEG, PNG, and WebP images are allowed."
    );
  }

  // 4. Validate aspect ratio (standard 4:5 = 0.80)
  // Allows slight rounding tolerance [0.75, 0.85] around 0.80
  const ratio = dimensions.width / dimensions.height;
  const minRatio = 0.75;
  const maxRatio = 0.85;

  if (ratio < minRatio || ratio > maxRatio) {
    throw new ApiError(
      400,
      `Invalid image aspect ratio (${ratio.toFixed(2)}:1). Images must have a 4:5 aspect ratio (e.g. 1200x1500 px or 800x1000 px).`
    );
  }

  return dimensions;
};

export default {
  validateImageBuffer,
};
