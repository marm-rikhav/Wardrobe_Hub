import sizeOf from "image-size";
import { ApiError } from "./apiError.js";

/**
 * Validates an image buffer for file size, supported format, and approximate 4:5 aspect ratio.
 *
 * Requirements:
 * 1. File size: Maximum 2 MB (2,097,152 bytes)
 * 2. Supported formats: JPG, JPEG, PNG, WebP only
 * 3. Recommended dimensions: 1200 x 1500 px with 4:5 aspect ratio
 *    - Allows reasonable dimension variations with ~15% tolerance: [0.68, 0.92]
 *
 * @param {Buffer} buffer - Image file buffer from multer memory storage
 * @returns {{ width: number, height: number, type: string }} Dimensions and format type
 */
export const validateImageBuffer = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new ApiError(400, "Invalid image data provided");
  }

  // 1. Max size: 2 MB (2 * 1024 * 1024 bytes)
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  if (buffer.length > MAX_FILE_SIZE) {
    throw new ApiError(
      400,
      "Image size exceeds the 2 MB limit. Maximum allowed size is 2 MB."
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
  // Allows reasonable dimension variations around 4:5 with ~15% tolerance
  const ratio = dimensions.width / dimensions.height;
  const minRatio = 0.68;
  const maxRatio = 0.92;

  if (ratio < minRatio || ratio > maxRatio) {
    throw new ApiError(
      400,
      `Invalid image aspect ratio (${ratio.toFixed(2)}:1). Images must have approximately a 4:5 aspect ratio (recommended 1200x1500 px).`
    );
  }

  return dimensions;
};

export default {
  validateImageBuffer,
};
