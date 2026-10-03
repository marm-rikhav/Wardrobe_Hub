import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  PersonOutline,
  HomeOutlined,
} from '@mui/icons-material';
import { useCustomer } from '../../hooks/index.js';
import NotFound from '../NotFound.jsx';
import { validateStrictEmail, validateStrictPhone } from '../../utils/validationRules.js';

const POSTAL_CODE_6_DIGIT_REGEX = /^\d{6}$/;

export const CustomerEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    customer,
    loading,
    saving,
    error: loadError,
    updateCustomer,
  } = useCustomer(id);

  const [saveError, setSaveError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
    // Address fields
    addressId: '',
    addressName: '',
    addressPhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      let defaultAddress = null;
      if (Array.isArray(customer.addresses) && customer.addresses.length > 0) {
        defaultAddress = customer.addresses.find((a) => a.isDefault) || customer.addresses[0];
      }

      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        isActive: typeof customer.isActive === 'boolean' ? customer.isActive : true,
        addressId: defaultAddress?.id || '',
        addressName: defaultAddress?.name || customer.name || '',
        addressPhone: defaultAddress?.phone || customer.phone || '',
        address: defaultAddress?.address || '',
        city: defaultAddress?.city || '',
        state: defaultAddress?.state || '',
        postalCode: defaultAddress?.postalCode || '',
        country: defaultAddress?.country || 'India',
      });
    }
  }, [customer]);

  const handleInputChange = (field) => (e) => {
    const value = field === 'isActive' ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // 1. Validate Customer Information
    const nameVal = formData.name.trim();
    if (!nameVal) {
      newErrors.name = 'Full name is required';
    } else if (nameVal.length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    } else if (nameVal.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    const emailVal = formData.email.trim();
    const emailResult = validateStrictEmail(emailVal);
    if (!emailResult.isValid) {
      newErrors.email = emailResult.message;
    }

    const phoneVal = formData.phone.trim();
    if (phoneVal) {
      const phoneResult = validateStrictPhone(phoneVal, true);
      if (!phoneResult.isValid) {
        newErrors.phone = phoneResult.message;
      }
    }

    // 2. Validate Address Information (if any address field is entered or editing existing address)
    const hasAnyAddressValue = Boolean(
      formData.addressId ||
      formData.address.trim() ||
      formData.city.trim() ||
      formData.state.trim() ||
      formData.postalCode.trim()
    );

    if (hasAnyAddressValue) {
      const addrName = formData.addressName.trim() || nameVal;
      if (!addrName) {
        newErrors.addressName = 'Recipient name is required';
      } else if (addrName.length < 2) {
        newErrors.addressName = 'Name must be at least 2 characters long';
      } else if (addrName.length > 100) {
        newErrors.addressName = 'Name cannot exceed 100 characters';
      }

      const addrPhone = formData.addressPhone.trim() || phoneVal;
      if (!addrPhone) {
        newErrors.addressPhone = 'Contact phone number is required';
      } else {
        const addrPhoneResult = validateStrictPhone(addrPhone);
        if (!addrPhoneResult.isValid) {
          newErrors.addressPhone = addrPhoneResult.message;
        }
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
      }

      const stateVal = formData.state.trim();
      if (!stateVal) {
        newErrors.state = 'State is required';
      } else if (stateVal.length < 2) {
        newErrors.state = 'State must be at least 2 characters long';
      }

      const pinVal = formData.postalCode.trim();
      if (!pinVal) {
        newErrors.postalCode = 'PIN / Postal code is required';
      } else if (!POSTAL_CODE_6_DIGIT_REGEX.test(pinVal)) {
        newErrors.postalCode = 'PIN / Postal code must be exactly 6 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaveError(null);
    try {
      const hasAnyAddressValue = Boolean(
        formData.addressId ||
        formData.address.trim() ||
        formData.city.trim() ||
        formData.state.trim() ||
        formData.postalCode.trim()
      );

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        isActive: formData.isActive,
      };

      if (hasAnyAddressValue) {
        payload.address = {
          id: formData.addressId || undefined,
          name: formData.addressName.trim() || formData.name.trim(),
          phone: formData.addressPhone.trim() || formData.phone.trim() || undefined,
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim() || 'India',
          isDefault: true,
        };
      }

      await updateCustomer(payload);

      navigate(`/admin/customers/${id}`, {
        state: {
          message: 'Customer profile and address updated successfully in one click.',
        },
      });
    } catch (err) {
      setSaveError(
        err.response?.data?.message || 'Failed to update customer details.'
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (loadError || !customer) {
    return (
      <NotFound
        title="Customer Not Found"
        message={loadError || 'The requested customer profile could not be found or the ID is invalid.'}
        backPath="/admin/customers"
        backLabel="Back to Customers"
      />
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 950, mx: 'auto', pb: 6 }}>
      {/* Back Button & Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/admin/customers/${id}`)}
          sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}
        >
          Back to Customer Details
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                width: 52,
                height: 52,
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              {(formData.name || formData.email || 'C').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1" fontWeight={700}>
                Edit Customer
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Customer ID: {id} • Update user profile and address together
              </Typography>
            </Box>
          </Box>

          <Chip
            size="small"
            label={formData.isActive ? 'ACTIVE' : 'INACTIVE'}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: formData.isActive ? 'rgba(47, 125, 79, 0.12)' : 'rgba(192, 57, 43, 0.12)',
              color: formData.isActive ? '#2F7D4F' : '#C0392B',
              px: 1,
            }}
          />
        </Box>
      </Box>

      {saveError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {saveError}
        </Alert>
      )}

      {/* Main Unified Edit Form */}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Section 1: Customer Profile Information */}
        <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PersonOutline color="primary" />
              <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                Customer Profile Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Full Name"
                  required
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mobile Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="10-digit mobile number (starts with 6-9)"
                  error={Boolean(errors.phone)}
                  helperText={errors.phone || 'Optional 10-digit mobile number'}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleInputChange('isActive')}
                      color="success"
                      disabled={saving}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600}>
                      {formData.isActive ? 'Active Account (Allowed to login)' : 'Inactive (Deactivated - login restricted)'}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 2: Customer Address Details */}
        <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HomeOutlined color="primary" />
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                  Primary Customer Address
                </Typography>
              </Box>

              <Chip
                size="small"
                label={formData.addressId ? 'EXISTING SAVED ADDRESS' : 'NEW ADDRESS'}
                variant="outlined"
                color={formData.addressId ? 'primary' : 'default'}
                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
              />
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Recipient / Contact Name"
                  placeholder="Defaults to customer name"
                  value={formData.addressName}
                  onChange={handleInputChange('addressName')}
                  error={Boolean(errors.addressName)}
                  helperText={errors.addressName}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Delivery Contact Phone"
                  placeholder="10-digit mobile number"
                  value={formData.addressPhone}
                  onChange={handleInputChange('addressPhone')}
                  error={Boolean(errors.addressPhone)}
                  helperText={errors.addressPhone || '10-digit mobile number starting with 6-9'}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Street Address / House No. / Building"
                  placeholder="e.g. 102 Crystal Residency, MG Road"
                  value={formData.address}
                  onChange={handleInputChange('address')}
                  error={Boolean(errors.address)}
                  helperText={errors.address}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  placeholder="e.g. Mumbai, Surat"
                  value={formData.city}
                  onChange={handleInputChange('city')}
                  error={Boolean(errors.city)}
                  helperText={errors.city}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="State"
                  placeholder="e.g. Gujarat, Maharashtra"
                  value={formData.state}
                  onChange={handleInputChange('state')}
                  error={Boolean(errors.state)}
                  helperText={errors.state}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="PIN / Postal Code"
                  placeholder="6-digit PIN code"
                  value={formData.postalCode}
                  onChange={handleInputChange('postalCode')}
                  error={Boolean(errors.postalCode)}
                  helperText={errors.postalCode}
                  disabled={saving}
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Country"
                  value={formData.country}
                  onChange={handleInputChange('country')}
                  disabled={saving}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* One-Click Action Footer */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Clicking Save will update the customer profile and address information simultaneously.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate(`/admin/customers/${id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              sx={{ px: 3.5, fontWeight: 700 }}
            >
              {saving ? 'Saving Changes...' : 'Save Changes (1-Click)'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CustomerEditPage;
