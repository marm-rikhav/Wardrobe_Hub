import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
  Alert,
  Skeleton,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircleOutline,
  CancelOutlined,
  HourglassEmptyOutlined,
  PersonOutline,
  EmailOutlined,
  PhoneOutlined,
  ReceiptLongOutlined,
  OpenInNew as OpenInNewIcon,
  AssignmentReturnOutlined,
  SwapHorizOutlined,
} from '@mui/icons-material';
import { useReturnRequest } from '../../hooks/index.js';
import { formatOrderDate } from '../../utils/orderConstants.js';
import ApproveConfirmDialog from '../../components/returns/ApproveConfirmDialog.jsx';
import RejectConfirmDialog from '../../components/returns/RejectConfirmDialog.jsx';
import NotFound from '../NotFound.jsx';

export const ReturnRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    request,
    loading,
    actionLoading,
    error,
    updateStatus,
  } = useReturnRequest(id);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

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

  const handleConfirmApprove = async () => {
    if (!request) return;
    try {
      const updated = await updateStatus('APPROVED');
      setApproveOpen(false);
      showSnackbar(`Request for order #${updated?.orderNumber || request.orderNumber} approved successfully`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve request';
      showSnackbar(msg, 'error');
    }
  };

  const handleConfirmReject = async (rejectionReason) => {
    if (!request) return;
    try {
      const updated = await updateStatus('REJECTED', rejectionReason);
      setRejectOpen(false);
      showSnackbar(`Request for order #${updated?.orderNumber || request.orderNumber} rejected`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject request';
      showSnackbar(msg, 'error');
    }
  };

  const renderStatusChip = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Chip
            size="medium"
            icon={<CheckCircleOutline fontSize="small" />}
            label="Approved"
            color="success"
            sx={{ fontWeight: 700 }}
          />
        );
      case 'REJECTED':
        return (
          <Chip
            size="medium"
            icon={<CancelOutlined fontSize="small" />}
            label="Rejected"
            color="error"
            sx={{ fontWeight: 700 }}
          />
        );
      case 'PENDING':
      default:
        return (
          <Chip
            size="medium"
            icon={<HourglassEmptyOutlined fontSize="small" />}
            label="Pending Review"
            color="warning"
            sx={{ fontWeight: 700 }}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', pb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton width={140} height={36} sx={{ mb: 2 }} />
          <Skeleton width={320} height={40} />
          <Skeleton width={220} height={24} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Skeleton variant="rounded" height={240} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={200} />
          </Grid>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rounded" height={280} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !request) {
    return (
      <NotFound
        title="Return Request Not Found"
        message={error || 'The requested return or exchange request does not exist or the ID is invalid.'}
        backPath="/admin/returns"
        backLabel="Back to Return Requests"
      />
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto', pb: 5 }}>
      {/* Top Navigation */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/returns')}
          sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}
        >
          Back to Return Requests
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="h5" component="h1" fontWeight={700}>
                {request.type === 'RETURN' ? 'Return Request' : 'Exchange Request'}
              </Typography>
              <Chip
                size="small"
                icon={
                  request.type === 'RETURN' ? (
                    <AssignmentReturnOutlined fontSize="small" />
                  ) : (
                    <SwapHorizOutlined fontSize="small" />
                  )
                }
                label={request.type}
                variant="outlined"
                color={request.type === 'RETURN' ? 'primary' : 'secondary'}
                sx={{ fontWeight: 700 }}
              />
              {renderStatusChip(request.status)}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Submitted on {formatOrderDate(request.createdAt)}
            </Typography>
          </Box>

          {request.status === 'PENDING' && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setRejectOpen(true)}
                disabled={actionLoading}
                sx={{ fontWeight: 600, px: 2.5 }}
              >
                Reject Request
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => setApproveOpen(true)}
                disabled={actionLoading}
                sx={{ fontWeight: 600, px: 2.5 }}
              >
                Approve Request
              </Button>
            </Stack>
          )}
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Order & Request Details */}
        <Grid item xs={12} md={7}>
          {/* Order Details Card */}
          <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ReceiptLongOutlined color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    Order Information
                  </Typography>
                </Box>
                {request.orderId && (
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    onClick={() => navigate(`/admin/orders/${request.orderId}`)}
                    sx={{ fontWeight: 600 }}
                  >
                    View Order
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Order Number
                  </Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                    {request.orderNumber || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Submission Timestamp
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatOrderDate(request.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Reason & Details Card */}
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Request Reason & Explanations
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Primary Reason
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {request.reason}
                </Typography>
              </Box>

              {request.details && (
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Additional Customer Comments
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {request.details}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Customer Info & Admin Decision */}
        <Grid item xs={12} md={5}>
          {/* Customer Info Card */}
          <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <PersonOutline color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Customer Details
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Customer Name
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {request.customerName || 'N/A'}
                  </Typography>
                </Box>

                {request.customerEmail && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Email Address
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25, wordBreak: 'break-all' }}>
                      {request.customerEmail}
                    </Typography>
                  </Box>
                )}

                {request.customerPhone && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Phone Number
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
                      {request.customerPhone}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Decision / Status Card */}
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Resolution Status
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {request.status === 'PENDING' && (
                <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>
                    Action Required
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                    This request is pending administrative review. You can approve or reject this request using the buttons above.
                  </Typography>
                </Alert>
              )}

              {request.status === 'APPROVED' && (
                <Alert severity="success" sx={{ borderRadius: 1.5 }}>
                  <Typography variant="body2" fontWeight={700}>
                    Request Approved
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    This {request.type?.toLowerCase()} request has been approved. The customer was notified and fulfillment/exchange process is activated.
                  </Typography>
                  {request.adminResponse && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                      <Typography variant="caption" fontWeight={700} display="block">
                        Admin Note:
                      </Typography>
                      <Typography variant="body2">{request.adminResponse}</Typography>
                    </Box>
                  )}
                </Alert>
              )}

              {request.status === 'REJECTED' && (
                <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                  <Typography variant="body2" fontWeight={700}>
                    Request Rejected
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    This request has been denied.
                  </Typography>
                  {request.adminResponse && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <Typography variant="caption" fontWeight={700} display="block">
                        Rejection Reason:
                      </Typography>
                      <Typography variant="body2">{request.adminResponse}</Typography>
                    </Box>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialogs */}
      <ApproveConfirmDialog
        open={approveOpen}
        request={request}
        loading={actionLoading}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleConfirmApprove}
      />

      <RejectConfirmDialog
        open={rejectOpen}
        request={request}
        loading={actionLoading}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleConfirmReject}
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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

export default ReturnRequestDetailPage;
