/**
 * Wardrobe Hub: Shared formatting utilities for INR currency and dates
 */

/**
 * Formats a numeric price into INR currency (e.g. ₹1,499)
 * @param {number|string} price
 * @param {object} [options]
 * @param {number} [options.fractionDigits=0]
 * @returns {string}
 */
export const formatPrice = (price, { fractionDigits = 0 } = {}) => {
  if (price === undefined || price === null || Number.isNaN(Number(price))) {
    return fractionDigits > 0 ? '₹0.00' : '₹0';
  }
  const numericPrice = Number(price);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(numericPrice);
};

/**
 * Formats an amount into INR currency with decimal precision (e.g. ₹1,499.00)
 * @param {number|string} amount
 * @param {number} [fractionDigits=2]
 * @returns {string}
 */
export const formatCurrency = (amount, fractionDigits = 2) => {
  const numeric = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(numeric);
};

/**
 * Formats an ISO date string into readable text (e.g. 15 Oct 2026)
 * @param {string|Date} dateString
 * @param {string} [fallback='']
 * @returns {string}
 */
export const formatDate = (dateString, fallback = '') => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Formats an ISO date string into date and time (e.g. 15 Oct 2026, 3:30 pm)
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const formatOrderDate = formatDateTime;

export default {
  formatPrice,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatOrderDate,
};
