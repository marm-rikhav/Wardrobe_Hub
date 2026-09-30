import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { useParams, Link, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import orderApi from '../../api/order.api.js';
import OrderStatusChip from '../../components/orders/OrderStatusChip.jsx';
import Loading from '../../components/common/Loading.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { formatPrice, formatDate } from '../../utils/formatters.js';

export const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const orderJustPlaced = Boolean(location.state?.orderJustPlaced);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await orderApi.getOrderById(id);
        setOrder(response.data?.order || null);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to load order details'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      const response = await orderApi.cancelOrder(order.id);
      setOrder(response.data?.order || { ...order, status: 'CANCELLED', paymentStatus: 'CANCELLED' });
      setCancelDialogOpen(false);
    } catch (err) {
      setCancelError(err.response?.data?.message || err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <ErrorMessage
          title="Order Not Found"
          error={error || 'Unable to display details for this order.'}
        />
        <Button
          component={Link}
          to="/orders"
          startIcon={<ArrowBackIcon />}
          variant="contained"
          sx={{ mt: 3 }}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  const { shippingAddress, items } = order;

  return (
    <Box sx={{ py: { xs: 3, md: 5 }, minHeight: '80vh' }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <MuiLink
            component={Link}
            to="/"
            underline="hover"
            color="inherit"
            fontSize="0.875rem"
          >
            Home
          </MuiLink>
          <MuiLink
            component={Link}
            to="/orders"
            underline="hover"
            color="inherit"
            fontSize="0.875rem"
          >
            My Orders
          </MuiLink>
          <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>
            {order.orderNumber}
          </Typography>
        </Breadcrumbs>

        {/* Cancel Error Alert */}
        {cancelError && (
          <Alert
            severity="error"
            onClose={() => setCancelError(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {cancelError}
          </Alert>
        )}

        {/* Success Banner if redirected from checkout */}
        {orderJustPlaced && (
          <Alert
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            severity="success"
            sx={{ mb: 4, borderRadius: 2 }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Order Placed Successfully!
            </Typography>
            <Typography variant="body2">
              Thank you for shopping with Wardrobe Hub. Your order #{order.orderNumber} has been received and is being processed.
            </Typography>
          </Alert>
        )}

        {/* Order Header Summary */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 4,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              ORDER NUMBER
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '0.02em' }}>
              {order.orderNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Placed on {formatDate(order.createdAt)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="caption" color="text.secondary" display="block">
                ORDER STATUS
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <OrderStatusChip status={order.status} size="medium" />
              </Box>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Left Column: Products snapshot */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
                Ordered Items ({items.length})
              </Typography>

              <Box>
                {items.map((item, index) => (
                  <Box key={item.id}>
                    <Box
                      sx={{
                        py: 2.5,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2.5,
                      }}
                    >
                      {/* Image */}
                      <Box
                        sx={{
                          width: { xs: 70, sm: 84 },
                          height: { xs: 88, sm: 105 },
                          borderRadius: 1,
                          overflow: 'hidden',
                          backgroundColor: '#f0ece6',
                          flexShrink: 0,
                        }}
                      >
                        {item.imageUrl ? (
                          <Box
                            component="img"
                            src={item.imageUrl}
                            alt={item.productName}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                            }}
                          >
                            No Image
                          </Box>
                        )}
                      </Box>

                      {/* Item Snapshot Details */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {item.productName}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, my: 0.8, flexWrap: 'wrap' }}>
                          <Typography variant="body2" color="text.secondary">
                            Size: <strong>{item.size}</strong>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ·
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Color: <strong>{item.color}</strong>
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          Price at Purchase: <strong>{formatPrice(item.unitPrice)}</strong> × {item.quantity}
                        </Typography>
                      </Box>

                      {/* Subtotal */}
                      <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          SUBTOTAL
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ color: 'accent.main', fontSize: '1.1rem' }}
                        >
                          {formatPrice(item.subtotal)}
                        </Typography>
                      </Box>
                    </Box>
                    {index < items.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
            </Paper>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/orders"
                startIcon={<ArrowBackIcon />}
                variant="outlined"
                color="inherit"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Back to All Orders
              </Button>
              <Button
                component={Link}
                to="/products"
                variant="contained"
                color="primary"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Continue Shopping
              </Button>
              {['PENDING', 'CONFIRMED'].includes(order.status) && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 600, ml: { xs: 0, sm: 'auto' } }}
                >
                  Cancel Order
                </Button>
              )}
            </Box>
          </Grid>

          {/* Right Column: Address snapshot & Financial summary */}
          <Grid item xs={12} md={4}>
            {/* Delivery Address Snapshot */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOnOutlinedIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Delivery Address Snapshot
                </Typography>
              </Box>

              {shippingAddress ? (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {shippingAddress.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {shippingAddress.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.postalCode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {shippingAddress.country}
                  </Typography>
                  <Typography variant="body2" color="text.primary" fontWeight={500}>
                    Phone: {shippingAddress.phone}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No address snapshot available
                </Typography>
              )}
            </Paper>

            {/* Payment & Total Breakdown */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PaymentOutlinedIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Payment Summary
                </Typography>
              </Box>

              <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Items Subtotal
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatPrice(order.subtotal)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: order.shippingFee === 0 ? 'success.main' : 'text.primary' }}
                  >
                    {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Status
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{
                      color:
                        order.paymentStatus === 'PAID'
                          ? 'success.main'
                          : order.paymentStatus === 'CANCELLED'
                          ? 'error.main'
                          : 'warning.main',
                    }}
                  >
                    {order.paymentStatus === 'PENDING'
                      ? 'Pending'
                      : order.paymentStatus === 'PAID'
                      ? 'Paid'
                      : order.paymentStatus === 'CANCELLED'
                      ? 'Cancelled'
                      : order.paymentStatus}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Total Paid / Payable
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ color: 'accent.main', fontSize: '1.4rem' }}
                >
                  {formatPrice(order.total)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Cancel Order Confirm Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        title="Cancel Order"
        message={`Are you sure you want to cancel order #${order?.orderNumber}? Any reserved inventory will be returned to stock.`}
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        confirmColor="error"
        loading={isCancelling}
        onConfirm={handleCancelOrder}
        onClose={() => setCancelDialogOpen(false)}
      />
    </Box>
  );
};

export default OrderDetail;
