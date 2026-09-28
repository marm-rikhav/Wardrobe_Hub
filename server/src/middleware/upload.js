import path from "path";
import multer from "multer";
import { ApiError } from "../utils/apiError.js";

// Keep files in memory as Buffers for direct streaming to Cloudinary
const storage = multer.memoryStorage();

// Accept only JPG, JPEG, PNG, and WebP image formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const ext = path.extname(file.originalname || "").toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const isMimeValid = allowedMimeTypes.includes(file.mimetype);
  const isExtValid = !file.originalname || allowedExtensions.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Unsupported file format. Only JPG, JPEG, PNG, and WebP images are allowed."
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB maximum file size
  },
});

export default upload;
