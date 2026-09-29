/**
 * Formats a numeric price into INR currency (e.g. ₹1,499)
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(Number(price))) {
    return '₹0';
  }
  const numericPrice = Number(price);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

/**
 * Formats an ISO date string into readable text
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};
