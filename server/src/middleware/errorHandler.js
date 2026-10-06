import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";

const handleZodError = (err) => ({
  statusCode: 400,
  message: "Validation Error",
  errors: err.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  })),
});

const handlePrismaKnownErrors = (err) => {
  if (err.code === "P2002") {
    const target = Array.isArray(err.meta?.target)
      ? err.meta.target.join(", ")
      : err.meta?.target || "Field";
    return {
      statusCode: 409,
      message: `${target} already exists`,
      errors: [{ field: target, message: `${target} already exists` }],
    };
  }

  if (err.code === "P2025") {
    return {
      statusCode: 404,
      message: "Resource not found",
      errors: [{ field: "id", message: "The requested resource was not found" }],
    };
  }

  const isInvalidUuid =
    err.code === "P2023" ||
    (typeof err.message === "string" &&
      (err.message.includes("invalid input syntax for type uuid") ||
        err.message.includes("Inconsistent column data")));

  if (isInvalidUuid) {
    return {
      statusCode: 404,
      message: "Resource not found",
      errors: [{ field: "id", message: "Invalid resource identifier format" }],
    };
  }

  return null;
};

const handleMulterError = (err) => {
  if (err.name === "MulterError" || err.code === "LIMIT_FILE_SIZE") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image size exceeds the 300 KB limit. Allowed size is 150 KB to 300 KB."
        : err.message || "File upload error";
    return {
      statusCode: 400,
      message,
    };
  }
  return null;
};

const isPrismaDatabaseError = (err) => {
  return (
    Boolean(err.name?.startsWith("PrismaClient")) ||
    Boolean(err.constructor?.name?.startsWith("PrismaClient")) ||
    (typeof err.message === "string" &&
      (err.message.includes("prisma.") ||
        err.message.includes("Invalid `prisma.") ||
        err.message.includes("Unknown field") ||
        err.message.includes("passwordHash")))
  );
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  if (err instanceof ZodError) {
    const zodResult = handleZodError(err);
    statusCode = zodResult.statusCode;
    message = zodResult.message;
    errors = zodResult.errors;
  } else {
    const prismaResult = handlePrismaKnownErrors(err);
    if (prismaResult) {
      statusCode = prismaResult.statusCode;
      message = prismaResult.message;
      errors = prismaResult.errors;
    } else {
      const multerResult = handleMulterError(err);
      if (multerResult) {
        statusCode = multerResult.statusCode;
        message = multerResult.message;
      } else if (isPrismaDatabaseError(err)) {
        statusCode = 500;
        message = "A database operation error occurred. Please contact support.";
        errors = [];
      } else if (err instanceof ApiError) {
        // Keep operational ApiError message
      } else if (statusCode === 500) {
        message = "An unexpected error occurred. Please try again later.";
      }
    }
  }

  // Only log genuine server errors (5xx) or unexpected unhandled errors with full stack trace
  // Operational client errors (4xx like validation, not found, conflicts) should not flood terminal during testing
  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}] ${req.method} ${req.originalUrl}:`, err);
  } else if (process.env.DEBUG_ERRORS === "true") {
    console.warn(`[Client ${statusCode}] ${req.method} ${req.originalUrl} - ${message}`);
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
