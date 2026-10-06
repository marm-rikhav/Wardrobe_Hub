import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { categorySchema } from '../../common/validation/categorySchemas.js';

export const CategoryDialog = ({
  open,
  onClose,
  onSubmit,
  category = null,
  loading = false,
  error = null,
}) => {
  const isEditing = Boolean(category);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      imageUrl: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          name: category.name || '',
          slug: category.slug || '',
          imageUrl: category.imageUrl || '',
          isActive: category.isActive ?? true,
        });
      } else {
        reset({
          name: '',
          slug: '',
          imageUrl: '',
          isActive: true,
        });
      }
    }
  }, [open, category, reset]);

  const onFormSubmit = (data) => {
    // Clean empty strings so backend handles them gracefully
    const payload = {
      name: data.name.trim(),
      slug: data.slug ? data.slug.trim() : undefined,
      imageUrl: data.imageUrl ? data.imageUrl.trim() : null,
      isActive: data.isActive,
    };
    onSubmit(payload);
  };

  let submitButtonLabel = 'Create Category';
  if (loading) {
    submitButtonLabel = 'Saving...';
  } else if (isEditing) {
    submitButtonLabel = 'Save Changes';
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: { xs: 1, sm: 2 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {isEditing ? 'Edit Category' : 'Add New Category'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 2.5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 1 }} data-testid="admin-category-dialog-error">
              {error}
            </Alert>
          )}

          {/* Category Name */}
          <TextField
            label="Category Name"
            placeholder="e.g. Men, Women, Accessories"
            fullWidth
            required
            autoFocus
            disabled={loading}
            inputProps={{ 'data-testid': 'admin-category-name-input' }}
            {...register('name')}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />

          {/* Slug */}
          <TextField
            label="Slug (Optional)"
            placeholder="e.g. men, women (auto-generated if empty)"
            fullWidth
            disabled={loading}
            inputProps={{ 'data-testid': 'admin-category-slug-input' }}
            {...register('slug')}
            error={Boolean(errors.slug)}
            helperText={
              errors.slug?.message ||
              'Leave blank to automatically generate from name.'
            }
          />

          {/* Image URL */}
          <TextField
            label="Image URL (Optional)"
            placeholder="https://example.com/category-image.jpg"
            fullWidth
            disabled={loading}
            inputProps={{ 'data-testid': 'admin-category-image-input' }}
            {...register('imageUrl')}
            error={Boolean(errors.imageUrl)}
            helperText={errors.imageUrl?.message}
          />

          {/* Status Switch */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Active Status
              </Typography>
              <Typography variant="caption" color="text.secondary">
                When active, this category is visible in the store catalog.
              </Typography>
            </Box>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={loading}
                      color="secondary"
                      data-testid="admin-category-status-switch"
                    />
                  }
                  label={field.value ? 'Active' : 'Inactive'}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit" data-testid="admin-category-cancel-btn">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            data-testid="admin-category-submit-btn"
          >
            {submitButtonLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

CategoryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  category: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    slug: PropTypes.string,
    imageUrl: PropTypes.string,
    isActive: PropTypes.bool,
  }),
  loading: PropTypes.bool,
  error: PropTypes.node,
};

export default CategoryDialog;
