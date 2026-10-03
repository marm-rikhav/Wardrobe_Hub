import React, { useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCart } from '../../hooks/useCart.js';
import { selectCart } from '../../store/cart/cartSlice.js';
import CartItemRow from '../../components/cart/CartItemRow.jsx';
import OrderSummaryCard from '../../components/cart/OrderSummaryCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Loading from '../../components/common/Loading.jsx';

export const Cart = () => {
  const navigate = useNavigate();
  const {
    items,
    totalItems,
    subtotal,
    loading,
    error,
    getCart,
    updateQuantity,
    removeItem,
    dismissError,
  } = useCart();

  const cartState = useSelector(selectCart);
  const itemLoadingMap = cartState.itemLoading || {};

  useEffect(() => {
    getCart();
  }, []);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (loading && (!items || items.length === 0)) {
    return <Loading fullScreen message="Loading your shopping cart..." />;
  }

  return (
    <Box sx={{ py: { xs: 3, md: 5 }, minHeight: '75vh' }}>
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
          <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>
            Shopping Cart
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 3 }}>
          Shopping Cart {totalItems > 0 && `(${totalItems})`}
        </Typography>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBagOutlinedIcon}
            title="Your Shopping Cart is Empty"
            description="Explore our handpicked collection of premium apparel and discover the perfect addition to your wardrobe."
            actionLabel="Start Shopping"
            onAction={() => navigate('/products')}
          />
        ) : (
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Cart Items List (Left Column) */}
            <Grid item xs={12} md={8}>
              <Box>
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    isUpdating={Boolean(itemLoadingMap[item.id])}
                    isRemoving={Boolean(itemLoadingMap[item.id])}
                  />
                ))}
              </Box>

              {/* Actions below items */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  component={Link}
                  to="/products"
                  startIcon={<ArrowBackIcon />}
                  color="inherit"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Continue Shopping
                </Button>
              </Box>
            </Grid>

            {/* Order Summary (Right Column) */}
            <Grid item xs={12} md={4}>
              <OrderSummaryCard
                subtotal={subtotal}
                totalItems={totalItems}
                shippingFee={0}
                actionText="Proceed to Checkout"
                onAction={handleProceedToCheckout}
                actionDisabled={items.length === 0}
              />
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Error Snackbar */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={dismissError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={dismissError}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cart;
