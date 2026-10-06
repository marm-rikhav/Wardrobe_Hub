import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Gracefully log unhandled rejections to prevent process freeze/silent crashes
process.on("unhandledRejection", (reason) => {
  console.error("[Unhandled Promise Rejection]:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[Uncaught Exception]:", err);
});
