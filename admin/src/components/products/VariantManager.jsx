import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Chip,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  EditOutlined,
  DeleteOutline,
} from '@mui/icons-material';
import { variantSchema } from '../../common/validation/productSchemas.js';

export const VariantManager = ({
  variants = [],
  onChange,
  disabled = false,
  error = null,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [variantFormError, setVariantFormError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: '',
      size: '',
      color: '',
      price: '',
      stock: 0,
      isActive: true,
    },
  });

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setVariantFormError(null);
    reset({
      sku: '',
      size: '',
      color: '',
      price: '',
      stock: 0,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    setVariantFormError(null);
    const v = variants[index];
    reset({
      id: v.id,
      sku: v.sku || '',
      size: v.size || '',
      color: v.color || '',
      price: v.price !== undefined && v.price !== null ? String(v.price) : '',
      stock: v.stock ?? 0,
      isActive: v.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingIndex(null);
    setVariantFormError(null);
  };

  const onSaveVariant = (data) => {
    const normalizedSku = data.sku.trim().toUpperCase();
    const normalizedSize = data.size.trim();
    const normalizedColor = data.color.trim();

    // Check duplicate SKU in list (excluding currently editing variant)
    const duplicateSku = variants.some(
      (v, idx) => idx !== editingIndex && v.sku.toUpperCase() === normalizedSku
    );
    if (duplicateSku) {
      setVariantFormError(`SKU "${normalizedSku}" is already used in this product's variants.`);
      return;
    }

    // Check duplicate Size + Color combination
    const duplicatePair = variants.some(
      (v, idx) =>
        idx !== editingIndex &&
        v.size.trim().toLowerCase() === normalizedSize.toLowerCase() &&
        v.color.trim().toLowerCase() === normalizedColor.toLowerCase()
    );
    if (duplicatePair) {
      setVariantFormError(
        `A variant with Size "${normalizedSize}" and Color "${normalizedColor}" already exists.`
      );
      return;
    }

    const updatedVariant = {
      ...(editingIndex !== null && variants[editingIndex]?.id
        ? { id: variants[editingIndex].id }
        : {}),
      sku: normalizedSku,
      size: normalizedSize,
      color: normalizedColor,
      price: data.price !== undefined && data.price !== null && data.price !== '' ? Number(data.price) : null,
      stock: Number(data.stock),
      isActive: data.isActive,
    };

    let nextVariants;
    if (editingIndex !== null) {
      nextVariants = [...variants];
      nextVariants[editingIndex] = updatedVariant;
    } else {
      nextVariants = [...variants, updatedVariant];
    }

    onChange(nextVariants);
    handleCloseModal();
  };

  const handleRemoveVariant = (index) => {
    const nextVariants = variants.filter((_, idx) => idx !== index);
    onChange(nextVariants);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header and Add Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Product Variants (Sizes & Colors)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Stock is tracked at the variant level. Every product requires at least one variant.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          disabled={disabled}
        >
          Add Variant
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Variants Table */}
      {variants.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'background.default',
            borderColor: error ? 'error.main' : 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No variants added yet. Click <strong>"Add Variant"</strong> to specify sizes, colors, SKUs, and inventory.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ maxHeight: 350, overflowX: 'auto' }}
        >
          <Table size="small" stickyHeader aria-label="variants table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Color</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                  Price Override
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                  Stock
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.map((variant, index) => (
                <TableRow key={variant.id || `${variant.sku}-${index}`} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {variant.sku}
                  </TableCell>
                  <TableCell>{variant.size}</TableCell>
                  <TableCell>{variant.color}</TableCell>
                  <TableCell align="right">
                    {variant.price ? `₹${Number(variant.price).toFixed(2)}` : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={variant.stock}
                      color={
                        variant.stock === 0
                          ? 'error'
                          : variant.stock <= 5
                          ? 'warning'
                          : 'success'
                      }
                      sx={{ fontWeight: 700, minWidth: 32 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={variant.isActive ? 'Active' : 'Inactive'}
                      variant="outlined"
                      color={variant.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Variant">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(index)}
                        disabled={disabled}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* Only allow removing unsaved variants or variants if more than 1 exists */}
                    <Tooltip title="Remove Variant">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveVariant(index)}
                        disabled={disabled || variants.length <= 1}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Variant Dialog */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingIndex !== null ? 'Edit Variant' : 'Add Product Variant'}
        </DialogTitle>

        <form onSubmit={handleSubmit(onSaveVariant)} noValidate>
          <DialogContent dividers sx={{ py: 2.5 }}>
            {variantFormError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {variantFormError}
              </Alert>
            )}

            <Grid container spacing={2}>
              {/* SKU */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="SKU"
                  placeholder="e.g. TSHIRT-BLK-M"
                  fullWidth
                  required
                  {...register('sku')}
                  error={Boolean(errors.sku)}
                  helperText={errors.sku?.message}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
              </Grid>

              {/* Stock */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Initial Stock"
                  type="number"
                  placeholder="0"
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 1 }}
                  {...register('stock')}
                  error={Boolean(errors.stock)}
                  helperText={errors.stock?.message || 'Must be 0 or greater'}
                />
              </Grid>

              {/* Size */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Size"
                  placeholder="e.g. S, M, L, XL, 32, One Size"
                  fullWidth
                  required
                  {...register('size')}
                  error={Boolean(errors.size)}
                  helperText={errors.size?.message}
                />
              </Grid>

              {/* Color */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Color"
                  placeholder="e.g. Black, White, Navy Blue"
                  fullWidth
                  required
                  {...register('color')}
                  error={Boolean(errors.color)}
                  helperText={errors.color?.message}
                />
              </Grid>

              {/* Custom Price Override */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Custom Price (₹) (Optional)"
                  type="number"
                  placeholder="Leave empty to use base price"
                  fullWidth
                  inputProps={{ min: 0.01, step: 0.01 }}
                  {...register('price')}
                  error={Boolean(errors.price)}
                  helperText={errors.price?.message}
                />
              </Grid>

              {/* Active Status */}
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="secondary"
                        />
                      }
                      label={field.value ? 'Variant Active' : 'Variant Inactive'}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseModal} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {editingIndex !== null ? 'Save Variant' : 'Add Variant'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default VariantManager;
