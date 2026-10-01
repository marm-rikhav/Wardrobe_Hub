import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Button,
  Box,
  Typography,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  VisibilityOutlined,
  ShoppingBagOutlined,
} from '@mui/icons-material';
import OrderStatusChip from './OrderStatusChip.jsx';
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

export const OrderTable = ({
  orders = [],
  loading = false,
  error = null,
  filterStatus = 'ALL',
  onViewDetail,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset to first page when filtered orders change
  useEffect(() => {
    setPage(0);
  }, [orders.length]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedOrders = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table aria-label="loading orders table">
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((key) => (
                <TableRow key={key}>
                  <TableCell><Skeleton width={110} height={24} /></TableCell>
                  <TableCell>
                    <Skeleton width={130} height={20} />
                    <Skeleton width={160} height={16} />
                  </TableCell>
                  <TableCell><Skeleton width={100} height={20} /></TableCell>
                  <TableCell align="center"><Skeleton width={40} height={20} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell align="right"><Skeleton width={70} height={20} sx={{ ml: 'auto' }} /></TableCell>
                  <TableCell align="center"><Skeleton width={80} height={24} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell align="right"><Skeleton width={90} height={30} sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (orders.length === 0) {
    const isFiltered = filterStatus && filterStatus !== 'ALL';
    const statusLabel = filterStatus.toLowerCase();
    const emptyTitle = isFiltered
      ? `No ${statusLabel} orders found.`
      : 'No orders found.';
    const emptySubtitle = isFiltered
      ? `There are currently no orders with "${filterStatus}" status in the system.`
      : 'No customer orders have been placed yet.';

    return (
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <ShoppingBagOutlined sx={{ fontSize: 52, color: 'text.secondary', mb: 1.5 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {emptyTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {emptySubtitle}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <TableContainer sx={{ maxHeight: 680 }}>
        <Table stickyHeader aria-label="admin orders table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Order</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Date</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                Items
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                Total
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                Status
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedOrders.map((order) => {
              const customerName = order.customer?.name || order.shippingAddress?.name || 'Customer';
              const customerEmail = order.customer?.email || '';

              return (
                <TableRow
                  key={order.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                  }}
                  onClick={() => onViewDetail?.(order.id)}
                >
                  {/* Order Number */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: 'primary.main',
                      }}
                    >
                      {order.orderNumber}
                    </Typography>
                  </TableCell>

                  {/* Customer Info */}
                  <TableCell>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {customerName}
                      </Typography>
                      {customerEmail && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ display: 'block' }}
                        >
                          {customerEmail}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatOrderDate(order.createdAt)}
                    </Typography>
                  </TableCell>

                  {/* Items Count */}
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={500}>
                      {order.itemCount ?? (order.items?.length ?? 0)}
                    </Typography>
                  </TableCell>

                  {/* Total Amount & Payment */}
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: 'accent.main' }}
                    >
                      {formatCurrency(order.total)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: getPaymentStatusColor(order.paymentStatus),
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      {order.paymentMethod === 'COD' ? 'COD' : order.paymentMethod || 'COD'}:{' '}
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </Typography>
                  </TableCell>

                  {/* Order Status Badge */}
                  <TableCell align="center">
                    <OrderStatusChip status={order.status} />
                  </TableCell>

                  {/* Action */}
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<VisibilityOutlined />}
                      onClick={() => onViewDetail?.(order.id)}
                      sx={{ minWidth: 100 }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

OrderTable.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      orderNumber: PropTypes.string,
      createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      total: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      status: PropTypes.string,
      itemCount: PropTypes.number,
      customer: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
      }),
      shippingAddress: PropTypes.shape({
        name: PropTypes.string,
      }),
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  filterStatus: PropTypes.string,
  onViewDetail: PropTypes.func.isRequired,
};

export default OrderTable;
