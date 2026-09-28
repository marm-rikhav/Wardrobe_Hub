import { ApiError } from "./apiError.js";

/**
 * Validates that requested quantity is valid and stock deduction does not cause negative stock.
 * Core business rule: Stock must never go below 0.
 *
 * @param {number} currentStock - Available quantity in inventory
 * @param {number} quantityToDeduct - Quantity requested to deduct (must be a positive integer)
 * @returns {number} The new calculated stock level
 * @throws {ApiError} If quantity is invalid or exceeds available stock
 */
export const calculateStockDeduction = (currentStock, quantityToDeduct) => {
  if (typeof currentStock !== "number" || currentStock < 0) {
    throw new ApiError(400, "Current stock must be a non-negative number");
  }

  if (typeof quantityToDeduct !== "number" || quantityToDeduct <= 0 || !Number.isInteger(quantityToDeduct)) {
    throw new ApiError(400, "Quantity to deduct must be a positive integer");
  }

  if (currentStock < quantityToDeduct) {
    throw new ApiError(
      400,
      `Insufficient stock. Available: ${currentStock}, Requested: ${quantityToDeduct}`
    );
  }

  const remainingStock = currentStock - quantityToDeduct;

  if (remainingStock < 0) {
    throw new ApiError(400, "Stock cannot fall below 0");
  }

  return remainingStock;
};

/**
 * Checks whether an item has sufficient stock without throwing an error
 * @param {number} currentStock
 * @param {number} quantityRequired
 * @returns {boolean}
 */
export const hasSufficientStock = (currentStock, quantityRequired) => {
  if (typeof currentStock !== "number" || currentStock < 0) return false;
  if (typeof quantityRequired !== "number" || quantityRequired <= 0) return false;
  return currentStock >= quantityRequired;
};

export default {
  calculateStockDeduction,
  hasSufficientStock,
};
