import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { subcategorySchema } from '../../common/validation/subcategorySchemas.js';

export const SubcategoryDialog = ({
  open,
  onClose,
  onSubmit,
  subcategory = null,
  categories = [],
  loading = false,
  error = null,
}) => {
  const isEditing = Boolean(subcategory);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      categoryId: '',
      name: '',
      slug: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (subcategory) {
        reset({
          categoryId: subcategory.categoryId || '',
          name: subcategory.name || '',
          slug: subcategory.slug || '',
          isActive: subcategory.isActive ?? true,
        });
      } else {
        reset({
          categoryId: categories.length > 0 ? categories[0].id : '',
          name: '',
          slug: '',
          isActive: true,
        });
      }
    }
  }, [open, subcategory, categories, reset]);

  const onFormSubmit = (data) => {
    const payload = {
      categoryId: data.categoryId,
      name: data.name.trim(),
      slug: data.slug ? data.slug.trim() : undefined,
      isActive: data.isActive,
    };
    onSubmit(payload);
  };

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
        {isEditing ? 'Edit Subcategory' : 'Add New Subcategory'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 2.5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}

          {/* Parent Category Select */}
          <FormControl fullWidth required error={Boolean(errors.categoryId)} disabled={loading}>
            <InputLabel id="parent-category-label">Parent Category</InputLabel>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  labelId="parent-category-label"
                  label="Parent Category"
                  {...field}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name} {!cat.isActive ? '(Inactive)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.categoryId && (
              <FormHelperText>{errors.categoryId.message}</FormHelperText>
            )}
          </FormControl>

          {/* Subcategory Name */}
          <TextField
            label="Subcategory Name"
            placeholder="e.g. Shirts, Jeans, Dresses, Sneakers"
            fullWidth
            required
            disabled={loading}
            {...register('name')}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />

          {/* Slug */}
          <TextField
            label="Slug (Optional)"
            placeholder="e.g. shirts, jeans (auto-generated if empty)"
            fullWidth
            disabled={loading}
            {...register('slug')}
            error={Boolean(errors.slug)}
            helperText={
              errors.slug?.message ||
              'Leave blank to automatically generate from name.'
            }
          />

          {/* Status Switch */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Active Status
              </Typography>
              <Typography variant="caption" color="text.secondary">
                When active, this subcategory is selectable for products.
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
                    />
                  }
                  label={field.value ? 'Active' : 'Inactive'}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Subcategory'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubcategoryDialog;
