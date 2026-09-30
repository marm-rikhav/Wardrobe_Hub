import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
  Snackbar,
} from '@mui/material';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import OrderStatusChip from '../../components/orders/OrderStatusChip.jsx';
import ReturnRequestDialog from '../../components/orders/ReturnRequestDialog.jsx';
import ReturnRequestStatusCard from '../../components/orders/ReturnRequestStatusCard.jsx';
import Loading from '../../components/common/Loading.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { formatPrice, formatDate } from '../../utils/formatters.js';
import {
  fetchOrderById,
  cancelOrder,
  createReturnRequest,
} from '../../store/order/orderThunks.js';
import {
  selectCurrentOrder,
  selectReturnRequest,
  selectOrderLoading,
  selectOrderActionLoading,
  selectOrderError,
  selectOrderSuccessMessage,
  clearOrderError,
  clearSuccessMessage,
} from '../../store/order/orderSlice.js';

const PAYMENT_STATUS_COLORS = {
  PAID: 'success.main',
  CANCELLED: 'error.main',
  PENDING: 'warning.main',
};

const PAYMENT_STATUS_LABELS = {
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  PENDING: 'Pending',
};

const OrderItemsCard = ({ items }) => (
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
);

OrderItemsCard.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      productName: PropTypes.string,
      imageUrl: PropTypes.string,
      size: PropTypes.string,
      color: PropTypes.string,
      unitPrice: PropTypes.number,
      quantity: PropTypes.number,
      subtotal: PropTypes.number,
    })
  ).isRequired,
};

const OrderActionButtons = ({
  isCancellable,
  isDelivered,
  hasActiveReturnRequest,
  actionLoading,
  onOpenCancel,
  onOpenReturn,
}) => (
  <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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

    {isCancellable && (
      <Button
        variant="outlined"
        color="error"
        onClick={onOpenCancel}
        disabled={actionLoading}
        sx={{ textTransform: 'none', fontWeight: 600, ml: { xs: 0, sm: 'auto' } }}
      >
        Cancel Order
      </Button>
    )}

    {isDelivered && !hasActiveReturnRequest && (
      <Box sx={{ display: 'flex', gap: 1.5, ml: { xs: 0, sm: 'auto' } }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AssignmentReturnOutlinedIcon />}
          onClick={() => onOpenReturn('RETURN')}
          disabled={actionLoading}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Return
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<SwapHorizOutlinedIcon />}
          onClick={() => onOpenReturn('EXCHANGE')}
          disabled={actionLoading}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Exchange
        </Button>
      </Box>
    )}
  </Box>
);

OrderActionButtons.propTypes = {
  isCancellable: PropTypes.bool.isRequired,
  isDelivered: PropTypes.bool.isRequired,
  hasActiveReturnRequest: PropTypes.bool.isRequired,
  actionLoading: PropTypes.bool,
  onOpenCancel: PropTypes.func.isRequired,
  onOpenReturn: PropTypes.func.isRequired,
};

const DeliveryAddressCard = ({ shippingAddress }) => (
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
);

DeliveryAddressCard.propTypes = {
  shippingAddress: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    postalCode: PropTypes.string,
    country: PropTypes.string,
    phone: PropTypes.string,
  }),
};

const PaymentSummaryCard = ({ order }) => {
  const isFreeShipping = order.shippingFee === 0;
  const paymentMethodLabel =
    order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod;
  const paymentStatusColor =
    PAYMENT_STATUS_COLORS[order.paymentStatus] || 'warning.main';
  const paymentStatusLabel =
    PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus;

  return (
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
            sx={{ color: isFreeShipping ? 'success.main' : 'text.primary' }}
          >
            {isFreeShipping ? 'FREE' : formatPrice(order.shippingFee)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Payment Method
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {paymentMethodLabel}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Payment Status
          </Typography>
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ color: paymentStatusColor }}
          >
            {paymentStatusLabel}
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
  );
};

PaymentSummaryCard.propTypes = {
  order: PropTypes.shape({
    subtotal: PropTypes.number,
    shippingFee: PropTypes.number,
    paymentMethod: PropTypes.string,
    paymentStatus: PropTypes.string,
    total: PropTypes.number,
  }).isRequired,
};

export const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const order = useSelector(selectCurrentOrder);
  const returnRequest = useSelector(selectReturnRequest);
  const loading = useSelector(selectOrderLoading);
  const actionLoading = useSelector(selectOrderActionLoading);
  const error = useSelector(selectOrderError);
  const successMessage = useSelector(selectOrderSuccessMessage);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnDialogType, setReturnDialogType] = useState('RETURN');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const orderJustPlaced = Boolean(location.state?.orderJustPlaced);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (successMessage) {
      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success',
      });
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      await dispatch(cancelOrder(order.id)).unwrap();
      setCancelDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Order cancelled successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err || 'Failed to cancel order',
        severity: 'error',
      });
    }
  };

  const handleOpenReturnDialog = (type) => {
    setReturnDialogType(type);
    setReturnDialogOpen(true);
  };

  const handleSubmitReturnRequest = async ({ type, reason, details }) => {
    if (!order) return;
    try {
      await dispatch(
        createReturnRequest({
          orderId: order.id,
          type,
          reason,
          details,
        })
      ).unwrap();
      setReturnDialogOpen(false);
      setSnackbar({
        open: true,
        message: `${type === 'RETURN' ? 'Return' : 'Exchange'} request submitted successfully`,
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err || 'Failed to submit request',
        severity: 'error',
      });
    }
  };

  if (loading && !order) {
    return <Loading fullScreen message="Loading order details..." />;
  }

  if (error && !order) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <ErrorMessage
          title="Order Not Found"
          error={error}
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

  if (!order) {
    return null;
  }

  const { shippingAddress, items = [] } = order;
  const isCancellable = ['PENDING', 'CONFIRMED'].includes(order.status);
  const isDelivered = order.status === 'DELIVERED';
  const hasActiveReturnRequest =
    Boolean(returnRequest) &&
    ['PENDING', 'APPROVED'].includes(returnRequest?.status);

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

        {/* Error Alert if action failed */}
        {error && (
          <Alert
            severity="error"
            onClose={() => dispatch(clearOrderError())}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
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

        {/* Return/Exchange Status Card if a request exists */}
        {returnRequest && <ReturnRequestStatusCard request={returnRequest} />}

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
          {/* Left Column: Products snapshot & Actions */}
          <Grid item xs={12} md={8}>
            <OrderItemsCard items={items} />
            <OrderActionButtons
              isCancellable={isCancellable}
              isDelivered={isDelivered}
              hasActiveReturnRequest={hasActiveReturnRequest}
              actionLoading={actionLoading}
              onOpenCancel={() => setCancelDialogOpen(true)}
              onOpenReturn={handleOpenReturnDialog}
            />
          </Grid>

          {/* Right Column: Address snapshot & Financial summary */}
          <Grid item xs={12} md={4}>
            <DeliveryAddressCard shippingAddress={shippingAddress} />
            <PaymentSummaryCard order={order} />
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
        loading={actionLoading}
        onConfirm={handleCancelOrder}
        onClose={() => setCancelDialogOpen(false)}
      />

      {/* Return / Exchange Request Dialog */}
      <ReturnRequestDialog
        open={returnDialogOpen}
        orderNumber={order?.orderNumber}
        initialType={returnDialogType}
        loading={actionLoading}
        onClose={() => setReturnDialogOpen(false)}
        onSubmit={handleSubmitReturnRequest}
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
