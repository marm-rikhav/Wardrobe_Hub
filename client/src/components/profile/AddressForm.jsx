import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Grid2 as Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
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
  const isEditing = Boolean(initialData?.id);

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

  let submitButtonLabel = 'Save Address';
  if (isSubmitting) {
    submitButtonLabel = 'Saving...';
  } else if (isEditing) {
    submitButtonLabel = 'Update Address';
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={600} sx={{ py: 1.5, px: 3 }}>
        {isEditing ? 'Edit Address' : 'Add New Address'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <DialogContent dividers sx={{ py: 2, px: 3 }}>
          <Grid container spacing={1.5}>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                size="small"
                id="name"
                label="Full Name"
                inputProps={{ 'data-testid': 'address-name-input' }}
                FormHelperTextProps={{ 'data-testid': 'address-name-error' }}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                {...register('name')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                size="small"
                id="phone"
                label="Phone Number"
                autoComplete="tel"
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  'data-testid': 'address-phone-input',
                }}
                FormHelperTextProps={{ 'data-testid': 'address-phone-error' }}
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
                {...register('phone', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replaceAll(/\D/g, '').slice(0, 10);
                  },
                })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                size="small"
                id="address"
                label="Street Address / House No / Apartment"
                multiline
                minRows={1}
                maxRows={2}
                inputProps={{ 'data-testid': 'address-street-input' }}
                FormHelperTextProps={{ 'data-testid': 'address-street-error' }}
                error={Boolean(errors.address)}
                helperText={errors.address?.message}
                {...register('address')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                size="small"
                id="city"
                label="City"
                inputProps={{ 'data-testid': 'address-city-input' }}
                FormHelperTextProps={{ 'data-testid': 'address-city-error' }}
                error={Boolean(errors.city)}
                helperText={errors.city?.message}
                {...register('city')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                size="small"
                id="state"
                label="State / Province"
                inputProps={{ 'data-testid': 'address-state-input' }}
                FormHelperTextProps={{ 'data-testid': 'address-state-error' }}
                error={Boolean(errors.state)}
                helperText={errors.state?.message}
                {...register('state')}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                required
                fullWidth
                size="small"
                id="postalCode"
                label="PIN / Postal Code"
                autoComplete="postal-code"
                inputProps={{
                  maxLength: 6,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  'data-testid': 'address-postal-code-input',
                }}
                FormHelperTextProps={{ 'data-testid': 'address-postal-code-error' }}
                error={Boolean(errors.postalCode)}
                helperText={errors.postalCode?.message}
                {...register('postalCode', {
                  onChange: (e) => {
                    e.target.value = e.target.value.replaceAll(/\D/g, '').slice(0, 6);
                  },
                })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                id="country"
                label="Country"
                defaultValue="India"
                inputProps={{ 'data-testid': 'address-country-input' }}
                error={Boolean(errors.country)}
                helperText={errors.country?.message}
                {...register('country')}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox size="small" {...field} checked={Boolean(field.value)} />}
                    label="Set as default shipping address"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            data-testid="address-submit-btn"
            disabled={isSubmitting}
            sx={{ fontWeight: 600 }}
          >
            {submitButtonLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>

    {/* Error Snackbar */}
    <Snackbar
      open={Boolean(error && open)}
      autoHideDuration={6000}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        severity="error"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {error}
      </Alert>
    </Snackbar>
  </>
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
