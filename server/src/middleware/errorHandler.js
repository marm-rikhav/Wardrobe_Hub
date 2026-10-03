import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Handle Zod validation errors if caught directly
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }

  // Handle Prisma unique constraint violation (P2002)
  if (err.code === "P2002") {
    statusCode = 409;
    const target = Array.isArray(err.meta?.target)
      ? err.meta.target.join(", ")
      : err.meta?.target || "Field";
    message = `${target} already exists`;
    errors = [{ field: target, message: `${target} already exists` }];
  }

  // Handle Prisma record not found (P2025)
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Resource not found";
    errors = [{ field: "id", message: "The requested resource was not found" }];
  }

  // Handle Prisma invalid input syntax / invalid UUID (P2023)
  if (
    err.code === "P2023" ||
    (typeof err.message === "string" &&
      (err.message.includes("invalid input syntax for type uuid") ||
        err.message.includes("Inconsistent column data")))
  ) {
    statusCode = 404;
    message = "Resource not found";
    errors = [{ field: "id", message: "Invalid resource identifier format" }];
  }

  // Handle Multer upload limits (e.g. file size > 300 KB)
  if (err.name === "MulterError" || err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Image size exceeds the 300 KB limit. Allowed size is 150 KB to 300 KB.";
    }
  }

  // Prevent internal Prisma or unhandled errors from leaking raw queries or sensitive data
  const isPrismaError =
    Boolean(err.name && err.name.startsWith("PrismaClient")) ||
    Boolean(err.constructor && err.constructor.name && err.constructor.name.startsWith("PrismaClient")) ||
    (typeof err.message === "string" &&
      (err.message.includes("prisma.") ||
        err.message.includes("Invalid `prisma.") ||
        err.message.includes("Unknown field") ||
        err.message.includes("passwordHash")));

  if (isPrismaError) {
    statusCode = 500;
    message = "A database operation error occurred. Please contact support.";
    errors = [];
  } else if (err instanceof ApiError) {
    // Keep operational ApiError message
  } else if (statusCode === 500) {
    message = "An unexpected error occurred. Please try again later.";
  }

  // Log non-operational or unexpected errors in development
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === "development" && err.stack && { stack: err.stack }),
  };

  return res.status(statusCode).json(response);
};

export default errorHandler;
