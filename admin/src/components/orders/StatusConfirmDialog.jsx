import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import OrderStatusChip from './OrderStatusChip.jsx';

export const StatusConfirmDialog = ({
  open = false,
  currentStatus = '',
  targetStatus = '',
  onClose,
  onConfirm,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Confirm Status Update
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="div" sx={{ color: 'text.primary', mb: 2 }}>
          Are you sure you want to change the order status?
        </DialogContentText>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <OrderStatusChip status={currentStatus} />
          <Box component="span" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            &rarr;
          </Box>
          <OrderStatusChip status={targetStatus} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={loading}
          sx={{ fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ minWidth: 100, fontWeight: 600 }}
        >
          {loading ? 'Updating...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

StatusConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  currentStatus: PropTypes.string,
  targetStatus: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default StatusConfirmDialog;
