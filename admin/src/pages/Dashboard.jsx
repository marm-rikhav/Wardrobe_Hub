import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Skeleton,

  Alert,
  Snackbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ShoppingBagOutlined,
  CurrencyRupeeOutlined,
  WarningAmberOutlined,
  PeopleAltOutlined,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Inventory2Outlined,
} from '@mui/icons-material';
import { useDashboard } from '../hooks/index.js';
import OrderStatusChip from '../components/orders/OrderStatusChip.jsx';
import { formatCurrency, formatDate } from '../utils/orderConstants.js';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, loading, error, refetch: fetchDashboardData } = useDashboard();

  let lowStockContent = null;
  if (loading) {
    lowStockContent = (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ my: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  } else if (!stats?.lowStockVariants || stats.lowStockVariants.length === 0) {
    lowStockContent = (
      <Box
        sx={{
          py: 6,
          px: 3,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 44, color: 'success.main', mb: 1 }} />
        <Typography variant="subtitle1" fontWeight={600} gutterBottom data-testid="admin-inventory-healthy-title">
          Inventory is Healthy
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={360}>
          All active product variants currently have more than 5 units in stock.
        </Typography>
      </Box>
    );
  }

  let recentOrdersContent = null;
  if (loading) {
    recentOrdersContent = (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ my: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  } else if (!stats?.recentOrders || stats.recentOrders.length === 0) {
    recentOrdersContent = (
      <Box sx={{ py: 6, px: 3, textAlign: 'center' }} data-testid="admin-no-recent-orders">
        <ShoppingBagOutlined sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          No Orders Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customer orders will be displayed here in real time.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
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
          <Typography variant="h5" component="h1" fontWeight={700} gutterBottom data-testid="admin-dashboard-title">
            Overview & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time business performance, revenue, orders, and stock alerts.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={loading}
          sx={{ flexShrink: 0 }}
          data-testid="admin-dashboard-refresh-btn"
        >
          Refresh Data
        </Button>
      </Box>



      {/* Metric KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 1,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Total Orders
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(17, 17, 17, 0.08)',
                    color: '#111111',
                    width: 40,
                    height: 40,
                  }}
                >
                  <ShoppingBagOutlined fontSize="small" />
                </Avatar>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="60%" height={40} />
              ) : (
                <Typography variant="h4" fontWeight={700} data-testid="admin-kpi-total-orders">
                  {stats?.totalOrders ?? 0}
                </Typography>
              )}
            </CardContent>
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate('/admin/orders')}
                sx={{ p: 0, color: 'accent.main', fontWeight: 600, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                data-testid="admin-kpi-link-orders"
              >
                View all orders
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 1,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Total Revenue
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(191, 168, 138, 0.2)',
                    color: '#8A6F4E',
                    width: 40,
                    height: 40,
                  }}
                >
                  <CurrencyRupeeOutlined fontSize="small" />
                </Avatar>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="80%" height={40} />
              ) : (
                <Typography variant="h4" fontWeight={700} sx={{ color: 'accent.main' }} data-testid="admin-kpi-total-revenue">
                  {formatCurrency(stats?.totalRevenue ?? 0)}
                </Typography>
              )}
            </CardContent>
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Net active & delivered volume
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Low-Stock Alerts */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 1,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: stats?.lowStockCount > 0 ? '#C0392B' : 'divider',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Low Stock Variants
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: stats?.lowStockCount > 0 ? 'rgba(192, 57, 43, 0.12)' : 'rgba(47, 125, 79, 0.12)',
                    color: stats?.lowStockCount > 0 ? '#C0392B' : '#2F7D4F',
                    width: 40,
                    height: 40,
                  }}
                >
                  <WarningAmberOutlined fontSize="small" />
                </Avatar>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="50%" height={40} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color={stats?.lowStockCount > 0 ? 'error.main' : 'success.main'}
                    data-testid="admin-kpi-low-stock"
                  >
                    {stats?.lowStockCount ?? 0}
                  </Typography>
                  {stats?.lowStockCount > 0 && (
                    <Chip label="Requires Action" size="small" color="error" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }} />
                  )}
                </Box>
              )}
            </CardContent>
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate('/admin/stock')}
                sx={{ p: 0, color: 'accent.main', fontWeight: 600, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                data-testid="admin-kpi-link-stock"
              >
                Manage stock
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Total Customers */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              p: 1,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Total Customers
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(191, 168, 138, 0.2)',
                    color: '#8A6F4E',
                    width: 40,
                    height: 40,
                  }}
                >
                  <PeopleAltOutlined fontSize="small" />
                </Avatar>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="60%" height={40} />
              ) : (
                <Typography variant="h4" fontWeight={700} data-testid="admin-kpi-total-customers">
                  {stats?.totalCustomers ?? 0}
                </Typography>
              )}
            </CardContent>
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate('/admin/customers')}
                sx={{ p: 0, color: 'accent.main', fontWeight: 600, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                data-testid="admin-kpi-link-customers"
              >
                View all customers
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Grid: Low Stock Alert Items & Recent Orders */}
      <Grid container spacing={3}>
        {/* Low-Stock Products / Variants Table */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Low Stock Inventory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Variants with 5 or fewer units remaining
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/admin/stock')}
                data-testid="admin-inventory-view-all-btn"
              >
                View All
              </Button>
            </Box>

            {lowStockContent || (
              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Product / SKU</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Variant</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Units</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.lowStockVariants.slice(0, 5).map((variant) => (
                      <TableRow key={variant.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {variant.imageUrl ? (
                              <Avatar
                                src={variant.imageUrl}
                                variant="rounded"
                                sx={{ width: 34, height: 34, border: '1px solid', borderColor: 'divider' }}
                              />
                            ) : (
                              <Avatar
                                variant="rounded"
                                sx={{ width: 34, height: 34, bgcolor: 'background.default', color: 'text.secondary' }}
                              >
                                <Inventory2Outlined sx={{ fontSize: 18 }} />
                              </Avatar>
                            )}
                            <Box sx={{ overflow: 'hidden' }}>
                              <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 160 }}>
                                {variant.productName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                {variant.sku}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>
                            {variant.size} / {variant.color}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color={variant.stock === 0 ? 'error.main' : 'warning.main'}
                          >
                            {variant.stock}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            label={variant.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                            color={variant.stock === 0 ? 'error' : 'default'}
                            sx={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              bgcolor: variant.stock > 0 ? 'rgba(191, 168, 138, 0.2)' : undefined,
                              color: variant.stock > 0 ? '#8A6F4E' : undefined,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>

        {/* Recent Orders Table */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Recent Orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest customer purchases and status
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/admin/orders')}
                data-testid="admin-recent-orders-view-all-btn"
              >
                View All
              </Button>
            </Box>

            {recentOrdersContent || (
              <TableContainer sx={{ maxHeight: 360 }} data-testid="admin-recent-orders-table">
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Order #</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentOrders.map((order) => (
                      <TableRow key={order.id} hover data-testid="admin-recent-order-row">
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            #{order.orderNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(order.createdAt, '—')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>
                            {order.customer?.name || order.shippingAddress?.name || 'Customer'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 140 }}>
                            {order.customer?.email || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {formatCurrency(order.total)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <OrderStatusChip status={order.status} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Order Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                              sx={{ color: 'accent.main' }}
                              data-testid="admin-recent-order-action-btn"
                            >
                              <ArrowForwardIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Error Snackbar */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
