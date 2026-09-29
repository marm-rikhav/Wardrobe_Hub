import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import {
  publicCategoryRouter,
  adminCategoryRouter,
} from "./routes/category.routes.js";
import {
  publicSubcategoryRouter,
  adminSubcategoryRouter,
} from "./routes/subcategory.routes.js";
import {
  publicProductRouter,
  adminProductRouter,
} from "./routes/product.routes.js";
import addressRoutes from "./routes/address.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { ApiError } from "./utils/apiError.js";

const app = express();

// Enable CORS with credentials for cookies and frontend communication
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  process.env.ADMIN_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
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

// Authentication Routes
app.use("/api/auth", authRoutes);

// Address Routes
app.use("/api/addresses", addressRoutes);
app.use("/api/user/addresses", addressRoutes);

// Catalog Public Routes
app.use("/api/categories", publicCategoryRouter);
app.use("/api/subcategories", publicSubcategoryRouter);
app.use("/api/products", publicProductRouter);

// Catalog Admin Routes
app.use("/api/admin/categories", adminCategoryRouter);
app.use("/api/admin/subcategories", adminSubcategoryRouter);
app.use("/api/admin/products", adminProductRouter);

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

// Global central error handling middleware (must be registered last)
app.use(errorHandler);

export default app;
