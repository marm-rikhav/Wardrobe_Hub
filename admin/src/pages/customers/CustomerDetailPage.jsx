import React, { useState} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  EditOutlined as EditIcon,
  EmailOutlined,
  PhoneOutlined,
  CalendarTodayOutlined,
  ShoppingBagOutlined,
  HomeOutlined,
  EditLocationOutlined,
  BlockOutlined,
  CheckCircleOutline,
  DeleteOutline,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useCustomer } from '../../hooks/index.js';
import { formatCurrency, formatOrderDate, ORDER_STATUS_COLORS } from '../../utils/orderConstants.js';
import AddressEditDialog from '../../components/customers/AddressEditDialog.jsx';
import DeleteConfirmDialog from '../../components/common/DeleteConfirmDialog.jsx';
import NotFound from '../NotFound.jsx';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    customer,
    loading,
    error,
    toggleStatus,
    updateAddress,
    deleteCustomer,
  } = useCustomer(id);

  // Address edit state
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: Boolean(location.state?.message),
    message: location.state?.message || '',
    severity: 'success',
  });

  const handleToggleStatus = async () => {
    if (!customer) return;
    const nextStatus = !customer.isActive;
    try {
      await toggleStatus(nextStatus);
      setSnackbar({
        open: true,
        message: nextStatus
          ? `Customer "${customer.name || customer.email}" activated successfully.`
          : `Customer "${customer.name || customer.email}" deactivated. Login access is now restricted.`,
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update customer status.',
        severity: 'error',
      });
    }
  };

  const handleOpenEditAddress = (addr) => {
    setSelectedAddress(addr);
    setAddressDialogOpen(true);
  };

  const handleSaveAddress = async (addressData) => {
    if (!customer || !selectedAddress) return;
    setAddressSaving(true);
    try {
      await updateAddress(selectedAddress.id, addressData);
      setAddressDialogOpen(false);
      setSelectedAddress(null);
      setSnackbar({
        open: true,
        message: 'Customer address updated successfully.',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update address.',
        severity: 'error',
      });
    } finally {
      setAddressSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!customer) return;
    setDeleteLoading(true);
    try {
      await deleteCustomer();
      navigate('/admin/customers', {
        state: {
          message: `Customer "${customer.name || customer.email}" deleted successfully.`,
        },
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete customer.',
        severity: 'error',
      });
      setDeleteDialogOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !customer) {
    return (
      <NotFound
        title="Customer Not Found"
        message={error || 'The requested customer profile does not exist, has been removed, or the ID is invalid.'}
        backPath="/admin/customers"
        backLabel="Back to Customers"
      />
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', pb: 6 }}>
      {/* Back Button & Header Actions */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/customers')}
          sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}
          data-testid="admin-customer-detail-back-btn"
        >
          Back to Customers
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          {/* Customer Avatar & Titles */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                width: 56,
                height: 56,
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              {(customer.name || customer.email || 'C').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h5" component="h1" fontWeight={700} data-testid="admin-customer-detail-name">
                  {customer.name || 'Unnamed Customer'}
                </Typography>
                <Chip
                  size="small"
                  label={customer.isActive ? 'ACTIVE' : 'INACTIVE'}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: customer.isActive ? 'rgba(47, 125, 79, 0.12)' : 'rgba(192, 57, 43, 0.12)',
                    color: customer.isActive ? '#2F7D4F' : '#C0392B',
                  }}
                  data-testid="admin-customer-detail-status-chip"
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                • Role: {customer.role}
              </Typography>
            </Box>
          </Box>

          {/* Quick Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/admin/customers/${customer.id}/edit`)}
              data-testid="admin-customer-detail-edit-btn"
            >
              Edit Customer
            </Button>

            <Button
              variant="outlined"
              color={customer.isActive ? 'warning' : 'success'}
              startIcon={customer.isActive ? <BlockOutlined /> : <CheckCircleOutline />}
              onClick={handleToggleStatus}
              data-testid="admin-customer-detail-toggle-status-btn"
            >
              {customer.isActive ? 'Deactivate' : 'Activate'}
            </Button>

            <Tooltip
              title={
                customer.totalOrders > 0
                  ? 'Cannot delete customer with order history (deactivate instead)'
                  : 'Delete Customer'
              }
            >
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={customer.totalOrders > 0}
                  startIcon={<DeleteOutline />}
                  onClick={() => setDeleteDialogOpen(true)}
                  data-testid="admin-customer-detail-delete-btn"
                >
                  Delete
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Customer Information Card */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
                PROFILE INFORMATION
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight={600} data-testid="admin-customer-detail-info-name">
                    {customer.name || '—'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Email Address
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <EmailOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1" data-testid="admin-customer-detail-info-email">{customer.email}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <PhoneOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1" data-testid="admin-customer-detail-info-phone">{customer.phone || '—'}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Member Since
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <CalendarTodayOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1">{formatOrderDate(customer.createdAt)}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Saved Addresses Section */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }} data-testid="admin-customer-detail-addresses-card">
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <HomeOutlined sx={{ fontSize: 22, color: 'text.secondary' }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  SAVED ADDRESSES ({customer.addresses?.length || 0})
                </Typography>
              </Box>

              {customer.addresses && customer.addresses.length > 0 ? (
                <Grid container spacing={2}>
                  {customer.addresses.map((addr) => (
                    <Grid item xs={12} sm={6} key={addr.id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          borderColor: addr.isDefault ? 'primary.main' : 'divider',
                          bgcolor: addr.isDefault ? 'rgba(191, 168, 138, 0.05)' : 'background.paper',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {addr.name}
                            </Typography>
                            {addr.isDefault && (
                              <Chip
                                label="DEFAULT"
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                              />
                            )}
                          </Box>
                          <Tooltip title="Edit this address">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditAddress(addr)}
                            >
                              <EditLocationOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {addr.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {addr.city}, {addr.state} - {addr.postalCode}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {addr.country || 'India'} • Phone: {addr.phone}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No saved addresses for this customer.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order History Section */}
        <Grid item xs={12}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingBagOutlined sx={{ fontSize: 22, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" fontWeight={700}>
                    ORDER HISTORY
                  </Typography>
                </Box>
                <Chip
                  label={`Total Orders: ${customer.totalOrders ?? 0}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Showing the 5 most recent orders placed by this customer.
              </Typography>

              {customer.recentOrders && customer.recentOrders.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(191, 168, 138, 0.08)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Order Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customer.recentOrders.map((ord) => {
                        const itemsCount = ord.totalItems ?? ord.orderItems?.length ?? 0;
                        const totalVal = ord.total ?? ord.totalAmount ?? 0;
                        return (
                          <TableRow key={ord.id} hover>
                            <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                              {ord.orderNumber}
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {formatOrderDate(ord.createdAt)}
                            </TableCell>
                            <TableCell>
                              {itemsCount} item{itemsCount === 1 ? '' : 's'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {formatCurrency(totalVal)}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={ord.status}
                                color={ORDER_STATUS_COLORS[ord.status] || 'default'}
                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={ord.paymentStatus}
                                variant="outlined"
                                color={ord.paymentStatus === 'PAID' ? 'success' : 'default'}
                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="View Order Details">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => navigate(`/admin/orders/${ord.id}`)}
                                >
                                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No orders placed yet by this customer.
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Address Dialog */}
      <AddressEditDialog
        open={addressDialogOpen}
        address={selectedAddress}
        saving={addressSaving}
        onClose={() => {
          setAddressDialogOpen(false);
          setSelectedAddress(null);
        }}
        onSave={handleSaveAddress}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Customer Account"
        itemName={customer ? `${customer.name} (${customer.email})` : ''}
        message="Are you sure you want to permanently delete this customer account? This action cannot be undone."
        loading={deleteLoading}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 600 }}
          data-testid="admin-customer-detail-snackbar"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerDetailPage;
