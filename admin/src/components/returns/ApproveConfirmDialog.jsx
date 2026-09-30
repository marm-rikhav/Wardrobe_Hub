import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';

export const ApproveConfirmDialog = ({
  open,
  request = null,
  loading = false,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="approve-dialog-title"
    >
      <DialogTitle id="approve-dialog-title" sx={{ pb: 1, fontWeight: 700, color: 'success.main' }}>
        Approve {request?.type === 'RETURN' ? 'Return' : 'Exchange'} Request
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to approve the {request?.type?.toLowerCase()} request for order{' '}
          <strong>{request?.orderNumber || 'this order'}</strong>?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading} sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          disabled={loading}
          onClick={onConfirm}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ fontWeight: 600 }}
        >
          {loading ? 'Approving...' : 'Confirm Approval'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ApproveConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  request: PropTypes.shape({
    id: PropTypes.string,
    orderNumber: PropTypes.string,
    type: PropTypes.string,
  }),
  loading: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ApproveConfirmDialog;
