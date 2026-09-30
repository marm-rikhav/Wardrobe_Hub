import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import orderApi from '../../api/order.api.js';
import OrderStatusChip from '../../components/orders/OrderStatusChip.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatPrice, formatDate } from '../../utils/formatters.js';

export const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await orderApi.getOrders();
        setOrders(response.data?.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <Loading fullScreen message="Loading your order history..." />;
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
          <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>
            My Orders
          </Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Order History
          </Typography>
          <Button
            component={Link}
            to="/products"
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Shop More
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {orders.length === 0 ? (
          <EmptyState
            icon={ReceiptLongOutlinedIcon}
            title="No Orders Yet"
            description="You have not placed any orders yet. Discover timeless pieces in our collection and make your first order."
            actionLabel="Start Shopping"
            onAction={() => navigate('/products')}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {orders.map((order) => (
              <Paper
                key={order.id}
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  overflow: 'hidden',
                }}
              >
                {/* Header Bar */}
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    backgroundColor: 'background.default',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', gap: { xs: 2, sm: 4 }, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        ORDER NUMBER
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {order.orderNumber}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        ORDER DATE
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDate(order.createdAt)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        TOTAL AMOUNT
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'accent.main' }}>
                        {formatPrice(order.total)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                    <OrderStatusChip status={order.status} />
                    <Button
                      component={Link}
                      to={`/orders/${order.id}`}
                      variant="contained"
                      size="small"
                      color="primary"
                      endIcon={<ChevronRightIcon fontSize="small" />}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>

                {/* Items List Inside Order */}
                <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Grid container spacing={2}>
                    {order.items.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 52,
                              height: 64,
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
                                  fontSize: '0.65rem',
                                }}
                              >
                                No Img
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {item.productName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                            </Typography>
                            <Typography variant="caption" fontWeight={600} color="accent.main">
                              {formatPrice(item.unitPrice)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Delivery summary */}
                  <Typography variant="caption" color="text.secondary">
                    Delivering to: <strong>{order.shippingAddress?.name}</strong> ·{' '}
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} ({order.shippingAddress?.postalCode})
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default OrderHistory;
