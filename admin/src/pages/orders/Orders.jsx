import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useOrders } from '../../hooks/index.js';
import OrderTable from '../../components/orders/OrderTable.jsx';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../../utils/orderConstants.js';

export const Orders = () => {
  const navigate = useNavigate();

  // Filters State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  } = useOrders(statusFilter === 'ALL' ? {} : { status: statusFilter });

  const handleRefresh = useCallback(() => {
    const params = {};
    if (statusFilter && statusFilter !== 'ALL') {
      params.status = statusFilter;
    }
    fetchOrders(params);
  }, [fetchOrders, statusFilter]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Client-side search across orderNumber, customer name, and customer email
  const filteredOrders = useMemo(() => {
    if (!search.trim()) {
      return orders;
    }
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const orderNum = (o.orderNumber || '').toLowerCase();
      const custName = (o.customer?.name || o.shippingAddress?.name || '').toLowerCase();
      const custEmail = (o.customer?.email || '').toLowerCase();
      return orderNum.includes(q) || custName.includes(q) || custEmail.includes(q);
    });
  }, [orders, search]);

  const handleViewDetail = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

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
          <Typography variant="h5" component="h1" fontWeight={700} gutterBottom>
            Orders Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View customer purchases, filter by fulfillment status, and track order progress.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
          sx={{ flexShrink: 0 }}
        >
          Refresh Orders
        </Button>
      </Box>

      {/* Filter and Search Card */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2}>
            {/* Search Input */}
            <Grid item xs={12} sm={7} md={8}>
              <TextField
                placeholder="Search by Order #, Customer Name, or Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={5} md={4}>
              <FormControl size="small" fullWidth>
                <InputLabel id="order-status-filter-label">Filter Status</InputLabel>
                <Select
                  labelId="order-status-filter-label"
                  label="Filter Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Orders</MenuItem>
                  {ORDER_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {ORDER_STATUS_LABELS[status] || status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <OrderTable
        orders={filteredOrders}
        loading={loading}
        error={error}
        filterStatus={statusFilter}
        onViewDetail={handleViewDetail}
      />
    </Box>
  );
};

export default Orders;
