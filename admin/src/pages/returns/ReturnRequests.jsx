import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useReturnRequests } from '../../hooks/index.js';
import ReturnRequestTable from '../../components/returns/ReturnRequestTable.jsx';
import ReturnDetailDialog from '../../components/returns/ReturnDetailDialog.jsx';
import RejectConfirmDialog from '../../components/returns/RejectConfirmDialog.jsx';
import ApproveConfirmDialog from '../../components/returns/ApproveConfirmDialog.jsx';

export const ReturnRequests = () => {
  // Filters State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const {
    requests,
    loading,
    actionLoading,
    refetch: fetchRequests,
    updateRequestStatus,
  } = useReturnRequests();

  // Dialogs State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  // Feedback Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleRefresh = useCallback(() => {
    const params = {};
    if (statusFilter && statusFilter !== 'ALL') {
      params.status = statusFilter;
    }
    if (typeFilter && typeFilter !== 'ALL') {
      params.type = typeFilter;
    }
    fetchRequests(params);
  }, [fetchRequests, statusFilter, typeFilter]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Client-side search across orderNumber, customer name, and reason
  const filteredRequests = useMemo(() => {
    if (!search.trim()) {
      return requests;
    }
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const orderNum = (r.orderNumber || '').toLowerCase();
      const custName = (r.customerName || '').toLowerCase();
      const reason = (r.reason || '').toLowerCase();
      return orderNum.includes(q) || custName.includes(q) || reason.includes(q);
    });
  }, [requests, search]);

  const handleViewDetail = (req) => {
    setSelectedRequest(req);
    setDetailOpen(true);
  };

  const handleOpenApprove = (req) => {
    setSelectedRequest(req);
    setApproveOpen(true);
  };

  const handleOpenReject = (req) => {
    setSelectedRequest(req);
    setRejectOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequest) return;
    try {
      const updated = await updateRequestStatus(
        selectedRequest.id,
        { status: 'APPROVED' }
      );
      setApproveOpen(false);
      showSnackbar(`Request for order #${updated?.orderNumber || selectedRequest.orderNumber} approved successfully`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve request';
      showSnackbar(msg, 'error');
    }
  };

  const handleConfirmReject = async (rejectionReason) => {
    if (!selectedRequest) return;
    try {
      const updated = await updateRequestStatus(
        selectedRequest.id,
        {
          status: 'REJECTED',
          adminResponse: rejectionReason,
        }
      );
      setRejectOpen(false);
      showSnackbar(`Request for order #${updated?.orderNumber || selectedRequest.orderNumber} rejected`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject request';
      showSnackbar(msg, 'error');
    }
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
            Return & Exchange Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage customer post-delivery return and exchange requests.
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
          Refresh Requests
        </Button>
      </Box>

      {/* Filter and Search Card */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2}>
            {/* Search Input */}
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                placeholder="Search by Order #, Customer Name, or Reason..."
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
            <Grid item xs={6} sm={3} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel id="return-status-filter-label">Filter Status</InputLabel>
                <Select
                  labelId="return-status-filter-label"
                  label="Filter Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Type Filter */}
            <Grid item xs={6} sm={3} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel id="return-type-filter-label">Filter Type</InputLabel>
                <Select
                  labelId="return-type-filter-label"
                  label="Filter Type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="ALL">All Types</MenuItem>
                  <MenuItem value="RETURN">Return</MenuItem>
                  <MenuItem value="EXCHANGE">Exchange</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <ReturnRequestTable
        requests={filteredRequests}
        loading={loading}
        error={error}
        onViewDetail={handleViewDetail}
        onApprove={handleOpenApprove}
        onReject={handleOpenReject}
      />

      {/* Detail Dialog */}
      <ReturnDetailDialog
        open={detailOpen}
        request={selectedRequest}
        onClose={() => setDetailOpen(false)}
        onApprove={(req) => {
          setSelectedRequest(req);
          setApproveOpen(true);
        }}
        onReject={(req) => {
          setSelectedRequest(req);
          setRejectOpen(true);
        }}
      />

      {/* Approve Confirm Dialog */}
      <ApproveConfirmDialog
        open={approveOpen}
        request={selectedRequest}
        loading={actionLoading}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleConfirmApprove}
      />

      {/* Reject Confirm Dialog with Reason */}
      <RejectConfirmDialog
        open={rejectOpen}
        request={selectedRequest}
        loading={actionLoading}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleConfirmReject}
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default ReturnRequests;
