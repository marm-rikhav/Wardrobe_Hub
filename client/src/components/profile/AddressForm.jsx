import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '../../validations/address.schema.js';

export const AddressForm = ({
  open,
  onClose,
  onSubmitAddress,
  initialData = null,
  isSubmitting = false,
  error = null,
}) => {
  const isEditing = Boolean(initialData && initialData.id);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postalCode: initialData.postalCode || '',
        country: initialData.country || 'India',
        isDefault: initialData.isDefault || false,
      });
    } else {
      reset({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
      });
    }
  }, [initialData, reset, open]);

  const onFormSubmit = async (data) => {
    await onSubmitAddress(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={600}>
        {isEditing ? 'Edit Address' : 'Add New Address'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="name"
                label="Full Name"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                {...register('name')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="phone"
                label="Phone Number"
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
                {...register('phone')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="address"
                label="Street Address / House No / Apartment"
                multiline
                rows={2}
                error={Boolean(errors.address)}
                helperText={errors.address?.message}
                {...register('address')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="city"
                label="City"
                error={Boolean(errors.city)}
                helperText={errors.city?.message}
                {...register('city')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="state"
                label="State / Province"
                error={Boolean(errors.state)}
                helperText={errors.state?.message}
                {...register('state')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="postalCode"
                label="PIN / Postal Code"
                error={Boolean(errors.postalCode)}
                helperText={errors.postalCode?.message}
                {...register('postalCode')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="country"
                label="Country"
                defaultValue="India"
                error={Boolean(errors.country)}
                helperText={errors.country?.message}
                {...register('country')}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={Boolean(field.value)} />}
                    label="Set as default shipping address"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ fontWeight: 600 }}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Address' : 'Save Address'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

AddressForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitAddress: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    postalCode: PropTypes.string,
    country: PropTypes.string,
    isDefault: PropTypes.bool,
  }),
  isSubmitting: PropTypes.bool,
  error: PropTypes.node,
};

export default AddressForm;
