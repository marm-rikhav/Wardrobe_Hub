/**
 * Order status enums and display constants for Wardrobe Hub Admin
 */

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
];

export const ORDER_STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
};

export const ORDER_STATUS_COLORS = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  SHIPPED: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'error',
  RETURNED: 'default',
};

export const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'SHIPPED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURNED'],
  DELIVERED: ['RETURNED'],
  CANCELLED: [],
  RETURNED: [],
};

/**
 * Returns the recommended primary forward action based on current status.
 * Returns null if no valid forward action is available.
 *
 * @param {string} currentStatus
 * @returns {{ targetStatus: string, label: string, color: string } | null}
 */
export const getPrimaryStatusAction = (currentStatus) => {
  const normalized = (currentStatus || '').toUpperCase();
  switch (normalized) {
    case 'PENDING':
    case 'CONFIRMED':
      return {
        targetStatus: 'SHIPPED',
        label: 'Mark as Shipped',
        color: 'secondary',
      };
    case 'SHIPPED':
      return {
        targetStatus: 'DELIVERED',
        label: 'Mark as Delivered',
        color: 'success',
      };
    default:
      return null;
  }
};

import {
  formatCurrency,
  formatDate,
  formatOrderDate,
  formatDateTime,
} from '../../../shared/utils/formatters.js';

export {
  formatCurrency,
  formatDate,
  formatOrderDate,
  formatDateTime,
};

export default {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ALLOWED_STATUS_TRANSITIONS,
  getPrimaryStatusAction,
  formatCurrency,
  formatOrderDate,
};
