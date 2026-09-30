import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@mui/material';

export const OrderStatusChip = ({ status = 'PENDING', size = 'small' }) => {
  const normalized = (status || '').toUpperCase();

  let color = 'default';
  let label = normalized;

  switch (normalized) {
    case 'PENDING':
      color = 'warning';
      label = 'Pending';
      break;
    case 'CONFIRMED':
      color = 'info';
      label = 'Confirmed';
      break;
    case 'SHIPPED':
      color = 'secondary';
      label = 'Shipped';
      break;
    case 'DELIVERED':
      color = 'success';
      label = 'Delivered';
      break;
    case 'CANCELLED':
      color = 'error';
      label = 'Cancelled';
      break;
    case 'RETURNED':
      color = 'default';
      label = 'Returned';
      break;
    default:
      color = 'default';
      label = status;
      break;
  }

  return (
    <Chip
      size={size}
      color={color}
      label={label}
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
