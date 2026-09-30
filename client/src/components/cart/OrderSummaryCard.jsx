import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { formatPrice } from '../../utils/formatters.js';

export const OrderSummaryCard = ({
  subtotal,
  totalItems,
  shippingFee = 0,
  actionText = 'Proceed to Checkout',
  onAction,
  actionDisabled = false,
  actionLoading = false,
  showSecureNotice = true,
}) => {
  const finalTotal = subtotal + shippingFee;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        position: 'sticky',
        top: 90,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Order Summary
        </Typography>

        <Box sx={{ my: 2 }}>
          {/* Subtotal */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Items ({totalItems})
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatPrice(subtotal)}
            </Typography>
          </Box>

          {/* Shipping */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Standard Shipping
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: shippingFee === 0 ? 'success.main' : 'text.primary' }}
            >
              {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Total */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            mb: 3,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Estimated Total
          </Typography>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: 'accent.main', fontSize: '1.5rem' }}
          >
            {formatPrice(finalTotal)}
          </Typography>
        </Box>

        {/* Action Button */}
        {onAction && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={onAction}
            disabled={actionDisabled || actionLoading}
            startIcon={
              actionLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
            sx={{
              py: 1.6,
              fontWeight: 600,
              fontSize: '1rem',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: '#2b2b2b',
              },
            }}
          >
            {actionLoading ? 'Processing...' : actionText}
          </Button>
        )}

        {showSecureNotice && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8,
              mt: 2,
              color: 'text.secondary',
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: '0.95rem' }} />
            <Typography variant="caption">
              Safe & Secure Checkout
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

OrderSummaryCard.propTypes = {
  subtotal: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  shippingFee: PropTypes.number,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  actionDisabled: PropTypes.bool,
  actionLoading: PropTypes.bool,
  showSecureNotice: PropTypes.bool,
};

export default OrderSummaryCard;
