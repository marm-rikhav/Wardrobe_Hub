import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes, { adminOrderRouter } from "./routes/order.routes.js";
import { adminReturnRouter, customerReturnRouter } from "./routes/returnRequest.routes.js";
import adminCustomerRouter from "./routes/customer.routes.js";
import adminDashboardRouter from "./routes/dashboard.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { ApiError } from "./utils/apiError.js";

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting middleware
const isTestEnv = process.env.NODE_ENV === "test";

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isTestEnv ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTestEnv ? 10000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests, please try again after 15 minutes",
  },
});

app.use(globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

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
      if (allowedOrigins.indexOf(origin) !== -1 || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

// Customer Cart & Orders Routes
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/return-requests", customerReturnRouter);

// Catalog Public Routes
app.use("/api/categories", publicCategoryRouter);
app.use("/api/subcategories", publicSubcategoryRouter);
app.use("/api/products", publicProductRouter);

// Catalog Admin Routes
app.use("/api/admin/categories", adminCategoryRouter);
app.use("/api/admin/subcategories", adminSubcategoryRouter);
app.use("/api/admin/products", adminProductRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/return-requests", adminReturnRouter);
app.use("/api/admin/returns", adminReturnRouter);
app.use("/api/admin/customers", adminCustomerRouter);
app.use("/api/admin/dashboard", adminDashboardRouter);

// Catch-all for undefined routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

// Global central error handling middleware (must be registered last)
app.use(errorHandler);

export default app;
