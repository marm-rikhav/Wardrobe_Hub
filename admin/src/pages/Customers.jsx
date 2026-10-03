import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  TablePagination,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  PersonAddOutlined,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  PeopleOutline as PeopleOutlineIcon,
  EmailOutlined,
  PhoneOutlined,
  VisibilityOutlined,
  EditOutlined,
  DeleteOutline,
  CheckCircleOutline,
  BlockOutlined,
} from '@mui/icons-material';
import { useCustomers } from '../hooks/index.js';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog.jsx';

export const Customers = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    customers,
    pagination,
    loading,
    error,
    refetch: fetchCustomers,
    toggleCustomerStatus,
    deleteCustomer,
  } = useCustomers({ page: 1, limit: 10 });

  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Delete action states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: Boolean(location.state?.message),
    message: location.state?.message || '',
    severity: 'success',
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
    fetchCustomers({ page: 1, search: searchInput.trim() });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    fetchCustomers({ page: 1, search: '' });
  };

  const handleChangePage = (_event, newPage) => {
    fetchCustomers({ page: newPage + 1 });
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = Number.parseInt(event.target.value, 10);
    fetchCustomers({ page: 1, limit: newLimit });
  };

  const handleToggleStatus = async (customer) => {
    const nextStatus = !customer.isActive;
    try {
      await toggleCustomerStatus(customer.id, nextStatus);
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

  const handleOpenDelete = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteCustomer(customerToDelete.id);
      setSnackbar({
        open: true,
        message: `Customer "${customerToDelete.name || customerToDelete.email}" deleted successfully.`,
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
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

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  let customersContent = null;
  if (loading) {
    customersContent = (
      <Box sx={{ p: 3 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rectangular" height={52} sx={{ my: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  } else if (customers.length === 0) {
    customersContent = (
      <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
        <PeopleOutlineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5, opacity: 0.5 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {activeSearch ? 'No matching customers found' : 'No customers registered yet'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
          {activeSearch
            ? `No customer accounts match "${activeSearch}". Try checking spelling or using a different keyword.`
            : 'Customer profiles will appear here once users register on the storefront.'}
        </Typography>
        {activeSearch && (
          <Button variant="outlined" size="small" onClick={handleClearSearch}>
            Clear Search Filter
          </Button>
        )}
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
          <Typography variant="h5" component="h1" fontWeight={700} gutterBottom>
            Customers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View registered customer profiles and account activity.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchCustomers}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddOutlined />}
            onClick={() => navigate('/admin/customers/create')}
          >
            Create Customer
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchCustomers}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Search customers by name, email, or phone number..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (!e.target.value.trim() && activeSearch) {
                  setActiveSearch('');
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ flexShrink: 0, px: 3 }}
            >
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Customers Table Card */}
      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        {customersContent || (
          <>
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(191, 168, 138, 0.08)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact Details</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Orders Placed</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Joined Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      {/* Name & Avatar */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'secondary.main',
                              color: 'secondary.contrastText',
                              width: 36,
                              height: 36,
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          >
                            {(customer.name || customer.email || 'C').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {customer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Role: {customer.role}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Contact Details */}
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <EmailOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2">{customer.email}</Typography>
                          </Box>
                          {customer.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <PhoneOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {customer.phone}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>

                      {/* Orders Count */}
                      <TableCell align="center">
                        <Chip
                          label={`${customer.totalOrders} order${customer.totalOrders === 1 ? '' : 's'}`}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            bgcolor: customer.totalOrders > 0 ? 'rgba(191, 168, 138, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                            color: customer.totalOrders > 0 ? '#8A6F4E' : 'text.secondary',
                          }}
                        />
                      </TableCell>

                      {/* Joined Date */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(customer.createdAt)}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          size="small"
                          label={customer.isActive ? 'ACTIVE' : 'INACTIVE'}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            bgcolor: customer.isActive ? 'rgba(47, 125, 79, 0.12)' : 'rgba(192, 57, 43, 0.12)',
                            color: customer.isActive ? '#2F7D4F' : '#C0392B',
                          }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Customer Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/admin/customers/${customer.id}`)}
                            >
                              <VisibilityOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit Customer">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => navigate(`/admin/customers/${customer.id}/edit`)}
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={customer.isActive ? 'Deactivate Customer' : 'Activate Customer'}>
                            <IconButton
                              size="small"
                              color={customer.isActive ? 'warning' : 'success'}
                              onClick={() => handleToggleStatus(customer)}
                            >
                              {customer.isActive ? (
                                <BlockOutlined fontSize="small" />
                              ) : (
                                <CheckCircleOutline fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>

                          <Tooltip
                            title={
                              customer.totalOrders > 0
                                ? 'Cannot delete customer with order history (deactivate instead)'
                                : 'Delete Customer'
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={customer.totalOrders > 0}
                                onClick={() => handleOpenDelete(customer)}
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={pagination.total ?? customers.length}
              page={Math.max(0, pagination.page - 1)}
              onPageChange={handleChangePage}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Customer Account"
        itemName={customerToDelete ? `${customerToDelete.name} (${customerToDelete.email})` : ''}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Customers;
