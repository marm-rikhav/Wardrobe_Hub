import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { rejectReturnRequestSchema } from '../../common/validation/returnSchemas.js';

export const RejectConfirmDialog = ({
  open,
  request = null,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(rejectReturnRequestSchema),
    defaultValues: {
      reason: '',
    },
  });

  const reasonValue = watch('reason') || '';

  useEffect(() => {
    if (open) {
      reset({ reason: '' });
    }
  }, [open, reset]);

  const onFormSubmit = (data) => {
    onConfirm(data.reason.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="reject-dialog-title"
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogTitle id="reject-dialog-title" sx={{ pb: 1, fontWeight: 700, color: 'error.main' }}>
          Reject {request?.type === 'RETURN' ? 'Return' : 'Exchange'} Request
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to reject this request for order{' '}
            <strong>{request?.orderNumber || 'this order'}</strong>? Please provide a clear explanation for the customer.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason *"
            placeholder="Explain why this request is being rejected (e.g. return window expired, item used/washed, etc.)..."
            {...register('reason')}
            error={Boolean(errors.reason)}
            helperText={errors.reason?.message || `${reasonValue.length}/1000 characters`}
            disabled={loading}
            autoFocus
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={loading} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ fontWeight: 600 }}
          >
            {loading ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

RejectConfirmDialog.propTypes = {
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

export default RejectConfirmDialog;
