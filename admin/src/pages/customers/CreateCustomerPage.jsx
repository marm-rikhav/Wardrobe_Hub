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
import customerService from '../../services/customerService.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_10_DIGIT_REGEX = /^\d{10}$/;
const POSTAL_CODE_6_DIGIT_REGEX = /^\d{6}$/;

export const CreateCustomerPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
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
    const newErrors = {};

    // 1. Name: matches client registerSchema
    const nameVal = formData.name.trim();
    if (!nameVal) {
      newErrors.name = 'Name is required';
    } else if (nameVal.length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    } else if (nameVal.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    // 2. Email: matches client registerSchema
    const emailVal = formData.email.trim();
    if (!emailVal) {
      newErrors.email = 'Email is required';
    } else if (emailVal.length > 150) {
      newErrors.email = 'Email cannot exceed 150 characters';
    } else if (!EMAIL_REGEX.test(emailVal.toLowerCase())) {
      newErrors.email = 'Invalid email address format';
    }

    // 3. Password: matches client registerSchema
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (formData.password.length > 100) {
      newErrors.password = 'Password cannot exceed 100 characters';
    }

    // 4. Phone: matches client registerSchema
    const phoneVal = formData.phone.trim();
    if (phoneVal && !PHONE_10_DIGIT_REGEX.test(phoneVal)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    // 5. Address (if included): matches client addressSchema
    if (includeAddress) {
      const addrName = formData.addressName.trim() || nameVal;
      if (!addrName) {
        newErrors.addressName = 'Full name is required';
      } else if (addrName.length < 2) {
        newErrors.addressName = 'Name must be at least 2 characters long';
      } else if (addrName.length > 100) {
        newErrors.addressName = 'Name cannot exceed 100 characters';
      }

      const addrPhone = formData.addressPhone.trim() || phoneVal;
      if (!addrPhone) {
        newErrors.addressPhone = 'Phone number is required';
      } else if (!PHONE_10_DIGIT_REGEX.test(addrPhone)) {
        newErrors.addressPhone = 'Phone number must be exactly 10 digits';
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
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

      const created = await customerService.createCustomer(payload);
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
    } finally {
      setLoading(false);
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
