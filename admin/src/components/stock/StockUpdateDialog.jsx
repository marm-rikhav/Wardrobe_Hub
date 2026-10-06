import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { stockUpdateSchema } from '../../common/validation/stockSchemas.js';

export const StockUpdateDialog = ({
  open,
  onClose,
  onSubmit,
  record = null,
  loading = false,
  error = null,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stockUpdateSchema),
    defaultValues: {
      stock: 0,
    },
  });

  useEffect(() => {
    if (open && record?.variant) {
      reset({
        stock: record.variant.stock ?? 0,
      });
    }
  }, [open, record, reset]);

  const onFormSubmit = (data) => {
    onSubmit(data.stock);
  };

  if (!record) return null;

  const { product, variant } = record;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }} data-testid="admin-stock-dialog-title">
        Update Variant Stock
      </DialogTitle>

      <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <DialogContent dividers sx={{ py: 2.5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Variant Information Card */}
          <Box
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: 1.5,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} gutterBottom data-testid="admin-stock-dialog-product-name">
              {product?.name}
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
              <Chip
                size="small"
                label={`SKU: ${variant?.sku}`}
                data-testid="admin-stock-dialog-sku"
                sx={{ fontFamily: 'monospace', fontWeight: 600 }}
              />
              <Chip size="small" label={`Size: ${variant?.size}`} />
              <Chip size="small" label={`Color: ${variant?.color}`} />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Typography variant="body2" color="text.secondary">
              Current Stock:{' '}
              <strong style={{ color: variant?.stock === 0 ? '#C0392B' : '#111111' }} data-testid="admin-stock-dialog-current">
                {variant?.stock ?? 0} units
              </strong>
            </Typography>
          </Box>

          {/* Stock Input */}
          <TextField
            label="New Stock Level"
            type="number"
            fullWidth
            required
            autoFocus
            disabled={loading}
            inputProps={{ min: 0, step: 1, 'data-testid': 'admin-stock-input' }}
            FormHelperTextProps={{ 'data-testid': 'admin-stock-input-error' }}
            {...register('stock')}
            error={Boolean(errors.stock)}
            helperText={errors.stock?.message || 'Stock must be an integer 0 or greater'}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit" data-testid="admin-stock-cancel-btn">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            data-testid="admin-stock-save-btn"
          >
            {loading ? 'Updating...' : 'Save Stock'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

StockUpdateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  record: PropTypes.shape({
    product: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      brand: PropTypes.string,
    }),
    variant: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      sku: PropTypes.string,
      size: PropTypes.string,
      color: PropTypes.string,
      stock: PropTypes.number,
    }),
  }),
  loading: PropTypes.bool,
  error: PropTypes.node,
};

export default StockUpdateDialog;
