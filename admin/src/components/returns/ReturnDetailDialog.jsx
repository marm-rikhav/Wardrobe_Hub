import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  Alert,
} from '@mui/material';
import {
  CheckCircleOutline,
  CancelOutlined,
  HourglassEmptyOutlined,
  PersonOutline,
  EmailOutlined,
  PhoneOutlined,
  ReceiptLongOutlined,
} from '@mui/icons-material';
import { formatOrderDate } from '../../utils/orderConstants.js';

export const ReturnDetailDialog = ({
  open,
  request = null,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!request) return null;

  const renderStatusChip = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Chip
            size="small"
            icon={<CheckCircleOutline fontSize="small" />}
            label="Approved"
            color="success"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'REJECTED':
        return (
          <Chip
            size="small"
            icon={<CancelOutlined fontSize="small" />}
            label="Rejected"
            color="error"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'PENDING':
      default:
        return (
          <Chip
            size="small"
            icon={<HourglassEmptyOutlined fontSize="small" />}
            label="Pending"
            color="warning"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="return-detail-dialog-title"
    >
      <DialogTitle id="return-detail-dialog-title" sx={{ pb: 1, fontWeight: 700 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>
            {request.type === 'RETURN' ? 'Return Request' : 'Exchange Request'} Details
          </Typography>
          {renderStatusChip(request.status)}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2.5}>
          {/* Order Details */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ReceiptLongOutlined color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700}>
                Order Information
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Order Number: <strong>{request.orderNumber || 'N/A'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Requested On: {formatOrderDate(request.createdAt)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Customer Details - No Customer ID! */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Customer Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonOutline fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">
                  Name: <strong>{request.customerName || 'N/A'}</strong>
                </Typography>
              </Box>

              {request.customerEmail && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Email: <strong>{request.customerEmail}</strong>
                  </Typography>
                </Box>
              )}

              {request.customerPhone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Phone: <strong>{request.customerPhone}</strong>
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Request Reason & Details */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Reason & Explanations
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Primary Reason:</strong> {request.reason}
            </Typography>
            {request.details && (
              <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1, mt: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Additional Details from Customer:
                </Typography>
                <Typography variant="body2">{request.details}</Typography>
              </Box>
            )}
          </Grid>

          {/* Admin Response / Notes if present */}
          {request.adminResponse && (
            <Grid item xs={12}>
              <Alert severity={request.status === 'REJECTED' ? 'error' : 'info'} sx={{ borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Admin Response / Rejection Reason:
                </Typography>
                <Typography variant="body2">{request.adminResponse}</Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
          Close
        </Button>
        {request.status === 'PENDING' && (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                onClose();
                onReject(request);
              }}
              sx={{ fontWeight: 600 }}
            >
              Reject Request
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                onClose();
                onApprove(request);
              }}
              sx={{ fontWeight: 600 }}
            >
              Approve Request
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

ReturnDetailDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  request: PropTypes.shape({
    id: PropTypes.string,
    orderNumber: PropTypes.string,
    customerName: PropTypes.string,
    customerEmail: PropTypes.string,
    customerPhone: PropTypes.string,
    type: PropTypes.oneOf(['RETURN', 'EXCHANGE']),
    reason: PropTypes.string,
    details: PropTypes.string,
    status: PropTypes.oneOf(['PENDING', 'APPROVED', 'REJECTED']),
    adminResponse: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }),
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default ReturnDetailDialog;
