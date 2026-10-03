import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PersonAddOutlined,
  Visibility,
  VisibilityOff,
  HomeOutlined,
  InfoOutlined,
} from '@mui/icons-material';
import { useCustomer } from '../../hooks/index.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_10_DIGIT_REGEX = /^\d{10}$/;
const POSTAL_CODE_6_DIGIT_REGEX = /^\d{6}$/;

const setFieldError = (errMap, field, msg) => {
  errMap[field] = msg;
};

const validateUserFields = (data) => {
  const errors = {};
  const nameVal = data.name.trim();
  if (!nameVal) {
    setFieldError(errors, 'name', 'Name is required');
  } else if (nameVal.length < 3) {
    setFieldError(errors, 'name', 'Name must be at least 3 characters long');
  } else if (nameVal.length > 50) {
    setFieldError(errors, 'name', 'Name cannot exceed 50 characters');
  }

  const emailVal = data.email.trim();
  if (!emailVal) {
    setFieldError(errors, 'email', 'Email is required');
  } else if (emailVal.length > 150) {
    setFieldError(errors, 'email', 'Email cannot exceed 150 characters');
  } else if (!EMAIL_REGEX.test(emailVal.toLowerCase())) {
    setFieldError(errors, 'email', 'Invalid email address format');
  }

  const pwdVal = data.password;
  if (!pwdVal) {
    setFieldError(errors, 'password', 'Password is required');
  } else if (pwdVal.length < 6) {
    setFieldError(errors, 'password', 'Password must be at least 6 characters long');
  } else if (pwdVal.length > 100) {
    setFieldError(errors, 'password', 'Password cannot exceed 100 characters');
  }

  const phoneVal = data.phone.trim();
  if (phoneVal && !PHONE_10_DIGIT_REGEX.test(phoneVal)) {
    setFieldError(errors, 'phone', 'Phone number must be exactly 10 digits');
  }

  return errors;
};

const validateAddressFields = (data) => {
  const errors = {};
  const nameVal = data.name.trim();
  const phoneVal = data.phone.trim();

  const addrName = data.addressName.trim() || nameVal;
  if (!addrName) {
    setFieldError(errors, 'addressName', 'Full name is required');
  } else if (addrName.length < 2) {
    setFieldError(errors, 'addressName', 'Name must be at least 2 characters long');
  } else if (addrName.length > 100) {
    setFieldError(errors, 'addressName', 'Name cannot exceed 100 characters');
  }

  const addrPhone = data.addressPhone.trim() || phoneVal;
  if (!addrPhone) {
    setFieldError(errors, 'addressPhone', 'Phone number is required');
  } else if (!PHONE_10_DIGIT_REGEX.test(addrPhone)) {
    setFieldError(errors, 'addressPhone', 'Phone number must be exactly 10 digits');
  }

  const streetVal = data.address.trim();
  if (!streetVal) {
    setFieldError(errors, 'address', 'Street address is required');
  } else if (streetVal.length < 5) {
    setFieldError(errors, 'address', 'Address must be at least 5 characters long');
  }

  const cityVal = data.city.trim();
  if (!cityVal) {
    setFieldError(errors, 'city', 'City is required');
  } else if (cityVal.length < 2) {
    setFieldError(errors, 'city', 'City must be at least 2 characters long');
  } else if (cityVal.length > 100) {
    setFieldError(errors, 'city', 'City cannot exceed 100 characters');
  }

  const stateVal = data.state.trim();
  if (!stateVal) {
    setFieldError(errors, 'state', 'State is required');
  } else if (stateVal.length < 2) {
    setFieldError(errors, 'state', 'State must be at least 2 characters long');
  } else if (stateVal.length > 100) {
    setFieldError(errors, 'state', 'State cannot exceed 100 characters');
  }

  const pinVal = data.postalCode.trim();
  if (!pinVal) {
    setFieldError(errors, 'postalCode', 'PIN / Postal code is required');
  } else if (!POSTAL_CODE_6_DIGIT_REGEX.test(pinVal)) {
    setFieldError(errors, 'postalCode', 'PIN / Postal code must be exactly 6 digits');
  }

  return errors;
};

export const CreateCustomerPage = () => {
  const navigate = useNavigate();
  const { createCustomer, saving: loading } = useCustomer();

  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [includeAddress, setIncludeAddress] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    addressName: '',
    addressPhone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validate = () => {
    const userErrors = validateUserFields(formData);
    const addressErrors = includeAddress ? validateAddressFields(formData) : {};
    const newErrors = { ...userErrors, ...addressErrors };

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setServerError(null);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim() || undefined,
      };

      if (includeAddress) {
        payload.address = {
          name: formData.addressName.trim() || formData.name.trim(),
          phone: formData.addressPhone.trim() || formData.phone.trim() || undefined,
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: formData.country.trim() || 'India',
        };
      }

      const created = await createCustomer(payload);
      const newId = created?.id;
      if (newId) {
        navigate(`/admin/customers/${newId}`, {
          state: {
            message: `Customer "${created.name || created.email}" created successfully (deactivated on creation).`,
          },
        });
      } else {
        navigate('/admin/customers', {
          state: {
            message: 'Customer created successfully (deactivated on creation).',
          },
        });
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Failed to create customer account.'
      );
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', pb: 5 }}>
      {/* Back Button & Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/customers')}
          sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 600 }}
        >
          Back to Customers
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" component="h1" fontWeight={700}>
              Create Customer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Register a new customer profile with an optional initial shipping address.
            </Typography>
          </Box>
          <Chip
            label="CREATED AS DEACTIVATED"
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: 'rgba(192, 57, 43, 0.12)',
              color: '#C0392B',
              px: 1,
            }}
          />
        </Box>
      </Box>

      {/* Deactivation Policy Notice */}
      <Alert
        severity="info"
        icon={<InfoOutlined />}
        sx={{ mb: 3, borderRadius: 2 }}
      >
        Per application policy, newly created customer accounts are set to <strong>Inactive (Deactivated)</strong> upon creation. The customer will not be able to log in until an administrator explicitly activates their account.
      </Alert>

      {serverError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {serverError}
        </Alert>
      )}

      {/* Form Card */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Account & Profile */}
            <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 2, letterSpacing: 0.5 }}>
              ACCOUNT & PROFILE INFORMATION
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
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
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={Boolean(errors.password)}
                  helperText={errors.password || 'Minimum 6 characters'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="10-digit mobile number"
                  error={Boolean(errors.phone)}
                  helperText={errors.phone || 'Optional, exactly 10 digits'}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Initial Shipping Address */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HomeOutlined sx={{ fontSize: 22, color: 'text.secondary' }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  INITIAL SHIPPING ADDRESS
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeAddress}
                    onChange={(e) => setIncludeAddress(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={600}>
                    Include Address
                  </Typography>
                }
              />
            </Box>

            {includeAddress && (
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Recipient Full Name"
                    placeholder={formData.name || 'Leave blank to use customer name'}
                    value={formData.addressName}
                    onChange={handleInputChange('addressName')}
                    error={Boolean(errors.addressName)}
                    helperText={errors.addressName || 'Defaults to customer name if blank'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Contact Phone"
                    placeholder={formData.phone || 'Leave blank to use customer phone'}
                    value={formData.addressPhone}
                    onChange={handleInputChange('addressPhone')}
                    error={Boolean(errors.addressPhone)}
                    helperText={errors.addressPhone || 'Defaults to customer phone if blank'}
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
                    onChange={handleInputChange('address')}
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
                    onChange={handleInputChange('city')}
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
                    onChange={handleInputChange('state')}
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
                    onChange={handleInputChange('postalCode')}
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
                    onChange={handleInputChange('country')}
                  />
                </Grid>
              </Grid>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/admin/customers')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PersonAddOutlined />}
                sx={{ px: 3, fontWeight: 600 }}
              >
                {loading ? 'Creating...' : 'Create Customer (Deactivated)'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateCustomerPage;
