import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Snackbar,
  Alert,
  Skeleton,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ReceiptLongOutlined,
  CreditCardOutlined,
} from '@mui/icons-material';
import { useOrderDetail } from '../../hooks/index.js';
import NotFound from '../NotFound.jsx';
import OrderStatusChip from '../../components/orders/OrderStatusChip.jsx';
import OrderItems from '../../components/orders/OrderItems.jsx';
import CustomerInfoCard from '../../components/orders/CustomerInfoCard.jsx';
import DeliveryAddressCard from '../../components/orders/DeliveryAddressCard.jsx';
import OrderStatusAction from '../../components/orders/OrderStatusAction.jsx';
import { formatCurrency, formatOrderDate } from '../../utils/orderConstants.js';

const getPaymentStatusColor = (status) => {
  if (status === 'PAID') return 'success.main';
  if (status === 'CANCELLED') return 'error.main';
  return 'warning.main';
};

const getPaymentStatusLabel = (status) => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'PAID':
      return 'Paid';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status || 'Pending';
  }
};

export const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    order,
    loading,
    updating: isUpdating,
    error,
    updateOrderStatus,
  } = useOrderDetail(id);

  // Feedback Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await updateOrderStatus(newStatus);
      showSnackbar(`Order status updated to ${newStatus}!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update order status';
      showSnackbar(msg, 'error');
    }
  };



  if (loading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton width={140} height={36} sx={{ mb: 2 }} />
          <Skeleton width={280} height={40} />
          <Skeleton width={200} height={24} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={260} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={180} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={220} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <NotFound
        title="Order Not Found"
        message={error || 'The requested order does not exist or the order ID is invalid.'}
        backPath="/admin/orders"
        backLabel="Back to Orders"
      />
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Back Button */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/orders')}
          color="inherit"
          sx={{ fontWeight: 600 }}
        >
          Back to Orders
        </Button>
      </Box>

      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" component="h1" fontWeight={700}>
              Order #{order.orderNumber}
            </Typography>
            <OrderStatusChip status={order.status} size="medium" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Placed on {formatOrderDate(order.createdAt)}
          </Typography>
        </Box>

        {/* Quick Action in Header */}
        <OrderStatusAction
          currentStatus={order.status}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
        />
      </Box>

      {/* Main Content Layout */}
      <Grid container spacing={3}>
        {/* Left Column: Ordered Items and Financial Breakdown */}
        <Grid item xs={12} md={8}>
          {/* Ordered Items Snapshot */}
          <OrderItems items={order.items || []} />

          {/* Payment & Financial Summary Card */}
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardHeader
              title="Financial & Payment Summary"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              avatar={<ReceiptLongOutlined color="primary" />}
              sx={{ pb: 1 }}
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(order.subtotal)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping Fee
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {order.shippingFee > 0 ? formatCurrency(order.shippingFee) : 'Free'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Total Amount
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{ color: 'accent.main' }}
                  >
                    {formatCurrency(order.total)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Payment Method & Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, pt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CreditCardOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Payment Method
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod || 'COD'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Payment Status
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        color: getPaymentStatusColor(order.paymentStatus),
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    >
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </Box>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Customer Info, Shipping Address, and Order Control */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Customer Details */}
            <CustomerInfoCard customer={order.customer} />

            {/* Delivery Address Snapshot */}
            <DeliveryAddressCard address={order.shippingAddress} />

            {/* Status Management Summary */}
            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardHeader
                title="Status Management"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
                sx={{ pb: 1 }}
              />
              <Divider />
              <CardContent sx={{ pt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Current Order Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <OrderStatusChip status={order.status} size="medium" />
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Available Status Transition
                </Typography>
                <OrderStatusAction
                  currentStatus={order.status}
                  onUpdateStatus={handleUpdateStatus}
                  isUpdating={isUpdating}
                />
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderDetail;
