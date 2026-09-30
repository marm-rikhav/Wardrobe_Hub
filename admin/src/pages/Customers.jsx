import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  PersonAddOutlined,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  PeopleOutline as PeopleOutlineIcon,
  EmailOutlined,
  PhoneOutlined,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import customerService from '../services/customerService.js';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getCustomers({
        page: pagination.page,
        limit: pagination.limit,
        search: activeSearch,
      });
      setCustomers(data.customers || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load customer list. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, activeSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setActiveSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleChangePage = (_event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = Number.parseInt(event.target.value, 10);
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  /**
   * Requirement 2: The Create Customer action redirects the admin to the
   * storefront customer registration/create-account page.
   */
  const handleCreateCustomer = () => {
    const storefrontBaseUrl =
      import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000';
    const registerUrl = `${storefrontBaseUrl.replace(/\/$/, '')}/register`;
    window.open(registerUrl, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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

          <Tooltip title="Opens customer registration page in storefront">
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddOutlined />}
              endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
              onClick={handleCreateCustomer}
            >
              Create Customer
            </Button>
          </Tooltip>
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
              onChange={(e) => setSearchInput(e.target.value)}
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
        {loading ? (
          <Box sx={{ p: 3 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" height={52} sx={{ my: 1, borderRadius: 1 }} />
            ))}
          </Box>
        ) : customers.length === 0 ? (
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
        ) : (
          <>
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(191, 168, 138, 0.08)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact Details</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Orders Placed</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Joined Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Status</TableCell>
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
                      <TableCell align="right">
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page - 1}
              onPageChange={handleChangePage}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Card>
    </Box>
  );
};

export default Customers;
