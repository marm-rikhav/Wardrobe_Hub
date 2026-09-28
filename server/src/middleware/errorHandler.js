import { ZodError } from "zod";


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

  // Handle Multer upload limits (e.g. file size > 2 MB)
  if (err.name === "MulterError" || err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Image size exceeds the 2 MB limit. Maximum allowed size is 2 MB.";
    }
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
