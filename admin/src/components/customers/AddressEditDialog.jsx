import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Box,
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import { addressSchema } from '../../common/validation/customerSchemas.js';

export const AddressEditDialog = ({
  open,
  address,
  onClose,
  onSave,
  saving = false,
}) => {
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
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
    if (open) {
      if (address) {
        reset({
          name: address.name || '',
          phone: address.phone || '',
          address: address.address || '',
          city: address.city || '',
          state: address.state || '',
          postalCode: address.postalCode || '',
          country: address.country || 'India',
          isDefault: Boolean(address.isDefault),
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
      setServerError(null);
    }
  }, [address, open, reset]);

  const onFormSubmit = async (data) => {
    setServerError(null);
    try {
      await onSave({
        ...data,
        name: data.name.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.trim(),
        country: data.country.trim() || 'India',
        isDefault: Boolean(data.isDefault),
      });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update address.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Edit Customer Address
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={saving}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" id="address-edit-form" onSubmit={handleSubmit(onFormSubmit)} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Full Name"
                required
                {...register('name')}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Phone Number"
                required
                {...register('phone')}
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Street Address / Line"
                required
                multiline
                rows={2}
                {...register('address')}
                error={Boolean(errors.address)}
                helperText={errors.address?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="City"
                required
                {...register('city')}
                error={Boolean(errors.city)}
                helperText={errors.city?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="State"
                required
                {...register('state')}
                error={Boolean(errors.state)}
                helperText={errors.state?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Postal / PIN Code"
                required
                {...register('postalCode')}
                error={Boolean(errors.postalCode)}
                helperText={errors.postalCode?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Country"
                {...register('country')}
                error={Boolean(errors.country)}
                helperText={errors.country?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="isDefault"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={600}>
                        Set as Default Shipping Address
                      </Typography>
                    }
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="address-edit-form"
          variant="contained"
          color="primary"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
        >
          {saving ? 'Saving...' : 'Save Address'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddressEditDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  address: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    postalCode: PropTypes.string,
    country: PropTypes.string,
    isDefault: PropTypes.bool,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default AddressEditDialog;
