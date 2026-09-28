import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { ApiError } from "./utils/apiError.js";

const app = express();

// Enable CORS with credentials for cookies and frontend communication
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());

// Cookie parser middleware for reading refresh tokens
app.use(cookieParser());

// Health / test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Wardrobe Hub API is running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

// Global central error handling middleware (must be registered last)
app.use(errorHandler);

export default app;
