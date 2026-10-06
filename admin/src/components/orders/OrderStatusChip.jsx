import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@mui/material';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from '../../utils/orderConstants.js';

export const OrderStatusChip = ({ status = 'PENDING', size = 'small' }) => {
  const normalized = (status || '').toUpperCase();
  const color = ORDER_STATUS_COLORS[normalized] || 'default';
  const label = ORDER_STATUS_LABELS[normalized] || normalized;

  return (
    <Chip
      size={size}
      color={color}
      label={label}
      data-testid="admin-order-status-chip"
      sx={{
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    />
  );
};

OrderStatusChip.propTypes = {
  status: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium']),
};

export default OrderStatusChip;
