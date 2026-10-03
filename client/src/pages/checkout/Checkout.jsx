import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Button,
  Radio,
  Chip,
  Alert,
  Snackbar,
  Divider,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import orderApi from '../../api/order.api.js';
import { useCart } from '../../hooks/useCart.js';
import { useAddresses } from '../../hooks/useAddresses.js';
import AddressForm from '../../components/profile/AddressForm.jsx';
import OrderSummaryCard from '../../components/cart/OrderSummaryCard.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatPrice } from '../../utils/formatters.js';

export const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalItems, subtotal, loading: cartLoading, getCart, reset } = useCart();
  const {
    addresses,
    loading: addressLoading,
    error: addressError,
    addAddress,
  } = useAddresses();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addAddressError, setAddAddressError] = useState(null);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  useEffect(() => {
    getCart();
  }, []);

  // Pre-select default address, or first address if available
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const handleAddNewAddressSubmit = async (formData) => {
    setIsAddingAddress(true);
    setAddAddressError(null);
    const result = await addAddress(formData);
    setIsAddingAddress(false);
    if (result.success) {
      setAddressFormOpen(false);
      if (result.address?.id) {
        setSelectedAddressId(result.address.id);
      }
    } else {
      setAddAddressError(result.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setOrderError('Please select a shipping delivery address before placing order.');
      return;
    }

    if (items.length === 0) {
      setOrderError('Your cart is empty. Please add items to cart first.');
      return;
    }

    setIsPlacingOrder(true);
    setOrderError(null);

    try {
      const response = await orderApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod: 'COD',
      });

      const createdOrder = response.data?.order;

      // Clear client Redux cart state immediately to match the backend
      reset();

      // Navigate to order detail page
      if (createdOrder?.id) {
        navigate(`/orders/${createdOrder.id}`, {
          state: { orderJustPlaced: true, orderNumber: createdOrder.orderNumber },
          replace: true,
        });
      } else {
        navigate('/orders', { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to place order. Please review your cart and try again.';
      setOrderError(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartLoading || addressLoading) {
    return <Loading fullScreen message="Preparing checkout..." />;
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <EmptyState
          title="Your Cart is Empty"
          description="You cannot checkout with an empty cart. Please add items to your cart before proceeding."
          actionLabel="View Products"
          onAction={() => navigate('/products')}
        />
      </Container>
    );
  }

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
            to="/cart"
            underline="hover"
            color="inherit"
            fontSize="0.875rem"
          >
            Cart
          </MuiLink>
          <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>
            Checkout
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 3 }}>
          Checkout
        </Typography>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Main Checkout Column (Left) */}
          <Grid item xs={12} md={8}>
            {/* 1. Delivery Address Section */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                mb: 4,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2.5,
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  1. Delivery Address
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setAddressFormOpen(true)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Add New Address
                </Button>
              </Box>

              {addresses.length === 0 ? (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.default',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    You have no saved delivery addresses. Please add an address to continue.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setAddressFormOpen(true)}
                  >
                    Add Delivery Address
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <Grid item xs={12} sm={6} key={addr.id}>
                        <Paper
                          elevation={0}
                          onClick={() => setSelectedAddressId(addr.id)}
                          sx={{
                            p: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: isSelected
                              ? 'primary.main'
                              : 'divider',
                            backgroundColor: isSelected
                              ? 'rgba(17, 17, 17, 0.02)'
                              : 'background.paper',
                            transition: 'all 0.15s ease-in-out',
                            '&:hover': {
                              borderColor: isSelected
                                ? 'primary.main'
                                : 'text.secondary',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: 1,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Radio
                                checked={isSelected}
                                onChange={() => setSelectedAddressId(addr.id)}
                                value={addr.id}
                                name="selected-address"
                                size="small"
                                sx={{ p: 0.5, mr: 1 }}
                              />
                              <Typography variant="subtitle2" fontWeight={700}>
                                {addr.name}
                              </Typography>
                            </Box>
                            {addr.isDefault && (
                              <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: '0.9rem !important' }} />}
                                label="DEFAULT"
                                size="small"
                                color="secondary"
                                sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                              />
                            )}
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 0.5 }}>
                            {addr.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 0.5 }}>
                            {addr.city}, {addr.state} — {addr.postalCode}
                          </Typography>
                          <Typography variant="body2" color="text.primary" fontWeight={500} sx={{ ml: 4 }}>
                            Phone: {addr.phone}
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Paper>

            {/* 2. Payment Method Section */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                mb: 4,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                2. Payment Method
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(17, 17, 17, 0.02)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                <Radio
                  checked={true}
                  name="payment-method"
                  size="small"
                  sx={{ p: 0.5, mt: 0.2 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Cash on Delivery (COD)
                    </Typography>
                    <Chip
                      label="Available"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Pay with cash upon delivery of your order to your doorstep. No online transaction required.
                  </Typography>
                </Box>
              </Paper>
            </Paper>

            {/* 3. Order Review Items */}
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
                3. Review Items ({totalItems})
              </Typography>

              <Box>
                {items.map((item, index) => (
                  <Box key={item.id}>
                    <Box
                      sx={{
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      {/* Thumbnail */}
                      <Box
                        sx={{
                          width: 64,
                          height: 80,
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
                              fontSize: '0.7rem',
                            }}
                          >
                            No Image
                          </Box>
                        )}
                      </Box>

                      {/* Item Details */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {item.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ mt: 0.5 }}>
                          {formatPrice(item.price)} each
                        </Typography>
                      </Box>

                      {/* Subtotal */}
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'accent.main' }}>
                        {formatPrice(item.subtotal)}
                      </Typography>
                    </Box>
                    {index < items.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                  component={Link}
                  to="/cart"
                  startIcon={<ArrowBackIcon />}
                  color="inherit"
                  size="small"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Modify Cart
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar Summary & Action (Right) */}
          <Grid item xs={12} md={4}>
            <OrderSummaryCard
              subtotal={subtotal}
              totalItems={totalItems}
              shippingFee={0}
              actionText="Place Order — Cash on Delivery"
              onAction={handlePlaceOrder}
              actionDisabled={!selectedAddressId || items.length === 0}
              actionLoading={isPlacingOrder}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Address Form Dialog */}
      <AddressForm
        open={addressFormOpen}
        onClose={() => setAddressFormOpen(false)}
        onSubmitAddress={handleAddNewAddressSubmit}
        isSubmitting={isAddingAddress}
        error={addAddressError}
      />

      {/* Order Error Snackbar */}
      <Snackbar
        open={Boolean(orderError)}
        autoHideDuration={6000}
        onClose={() => setOrderError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOrderError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {orderError}
        </Alert>
      </Snackbar>

      {/* Address Error Snackbar */}
      <Snackbar
        open={Boolean(addressError)}
        autoHideDuration={6000}
        onClose={() => setAddressError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setAddressError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {addressError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Checkout;
