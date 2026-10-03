import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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

const PHONE_10_DIGIT_REGEX = /^\d{10}$/;
const POSTAL_CODE_6_DIGIT_REGEX = /^\d{6}$/;

export const AddressEditDialog = ({
  open,
  address,
  onClose,
  onSave,
  saving = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name || '',
        phone: address.phone || '',
        address: address.address || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || 'India',
        isDefault: Boolean(address.isDefault),
      });
      setErrors({});
      setServerError(null);
    }
  }, [address, open]);

  const handleChange = (field) => (e) => {
    const value = field === 'isDefault' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const nameVal = formData.name.trim();
    if (!nameVal) {
      newErrors.name = 'Full name is required';
    } else if (nameVal.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (nameVal.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    const phoneVal = formData.phone.trim();
    if (!phoneVal) {
      newErrors.phone = 'Phone number is required';
    } else if (!PHONE_10_DIGIT_REGEX.test(phoneVal)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    const streetVal = formData.address.trim();
    if (!streetVal) {
      newErrors.address = 'Street address is required';
    } else if (streetVal.length < 5) {
      newErrors.address = 'Address must be at least 5 characters long';
    }

    const cityVal = formData.city.trim();
    if (!cityVal) {
      newErrors.city = 'City is required';
    } else if (cityVal.length < 2) {
      newErrors.city = 'City must be at least 2 characters long';
    } else if (cityVal.length > 100) {
      newErrors.city = 'City cannot exceed 100 characters';
    }

    const stateVal = formData.state.trim();
    if (!stateVal) {
      newErrors.state = 'State is required';
    } else if (stateVal.length < 2) {
      newErrors.state = 'State must be at least 2 characters long';
    } else if (stateVal.length > 100) {
      newErrors.state = 'State cannot exceed 100 characters';
    }

    const pinVal = formData.postalCode.trim();
    if (!pinVal) {
      newErrors.postalCode = 'PIN / Postal code is required';
    } else if (!POSTAL_CODE_6_DIGIT_REGEX.test(pinVal)) {
      newErrors.postalCode = 'PIN / Postal code must be exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setServerError(null);
    try {
      await onSave({
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim() || 'India',
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

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Full Name"
                required
                value={formData.name}
                onChange={handleChange('name')}
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Phone Number"
                required
                value={formData.phone}
                onChange={handleChange('phone')}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
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
                value={formData.address}
                onChange={handleChange('address')}
                error={Boolean(errors.address)}
                helperText={errors.address}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="City"
                required
                value={formData.city}
                onChange={handleChange('city')}
                error={Boolean(errors.city)}
                helperText={errors.city}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="State"
                required
                value={formData.state}
                onChange={handleChange('state')}
                error={Boolean(errors.state)}
                helperText={errors.state}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Postal / PIN Code"
                required
                value={formData.postalCode}
                onChange={handleChange('postalCode')}
                error={Boolean(errors.postalCode)}
                helperText={errors.postalCode}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Country"
                value={formData.country}
                onChange={handleChange('country')}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDefault}
                    onChange={handleChange('isDefault')}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={600}>
                    Set as Default Shipping Address
                  </Typography>
                }
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
          onClick={handleSubmit}
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
