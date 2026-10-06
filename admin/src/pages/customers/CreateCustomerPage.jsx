import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Snackbar,
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
import { createCustomerSchema } from '../../common/validation/customerSchemas.js';

export const CreateCustomerPage = () => {
  const navigate = useNavigate();
  const { createCustomer, saving: loading } = useCustomer();

  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      includeAddress: true,
      addressName: '',
      addressPhone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
  });

  const includeAddress = watch('includeAddress');
  const watchedName = watch('name') || '';
  const watchedPhone = watch('phone') || '';

  const onFormSubmit = async (data) => {
    setServerError(null);
    try {
      const phoneTrimmed = data.phone ? data.phone.trim() : '';
      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: phoneTrimmed || undefined,
      };

      if (data.includeAddress) {
        payload.address = {
          name: data.addressName?.trim() || data.name.trim(),
          phone: data.addressPhone?.trim() || phoneTrimmed || undefined,
          address: data.address.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          postalCode: data.postalCode.trim(),
          country: data.country?.trim() || 'India',
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
      const rawMsg = err.response?.data?.message;
      const isInternalError =
        typeof rawMsg === 'string' &&
        (rawMsg.includes('prisma.') ||
          rawMsg.includes('passwordHash') ||
          rawMsg.includes('Unknown field') ||
          rawMsg.includes('invocation:'));

      setServerError(
        isInternalError
          ? 'Failed to create customer due to a server error. Please try again or contact support.'
          : rawMsg || 'Failed to create customer account.'
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
          data-testid="admin-customer-create-back-btn"
        >
          Back to Customers
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" component="h1" fontWeight={700} data-testid="admin-customer-create-title">
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

      {/* Form Card */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
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
                  {...register('name')}
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  inputProps={{ 'data-testid': 'admin-customer-create-name-input' }}
                  FormHelperTextProps={{ 'data-testid': 'admin-customer-create-name-error' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  type="email"
                  required
                  {...register('email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  inputProps={{ 'data-testid': 'admin-customer-create-email-input' }}
                  FormHelperTextProps={{ 'data-testid': 'admin-customer-create-email-error' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message || 'Minimum 6 characters'}
                  inputProps={{ 'data-testid': 'admin-customer-create-password-input' }}
                  FormHelperTextProps={{ 'data-testid': 'admin-customer-create-password-error' }}
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
                  placeholder="10-digit mobile number"
                  {...register('phone')}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone?.message || 'Optional, exactly 10 digits'}
                  inputProps={{ 'data-testid': 'admin-customer-create-phone-input' }}
                  FormHelperTextProps={{ 'data-testid': 'admin-customer-create-phone-error' }}
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

              <Controller
                name="includeAddress"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        color="primary"
                        inputProps={{ 'data-testid': 'admin-customer-create-include-address-checkbox' }}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={600}>
                        Include Address
                      </Typography>
                    }
                  />
                )}
              />
            </Box>

            {includeAddress && (
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Recipient Full Name"
                    placeholder={watchedName || 'Leave blank to use customer name'}
                    {...register('addressName')}
                    error={Boolean(errors.addressName)}
                    helperText={errors.addressName?.message || 'Defaults to customer name if blank'}
                    inputProps={{ 'data-testid': 'admin-customer-create-address-name-input' }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Contact Phone"
                    placeholder={watchedPhone || 'Leave blank to use customer phone'}
                    {...register('addressPhone')}
                    error={Boolean(errors.addressPhone)}
                    helperText={errors.addressPhone?.message || 'Defaults to customer phone if blank'}
                    inputProps={{ 'data-testid': 'admin-customer-create-address-phone-input' }}
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
                    inputProps={{ 'data-testid': 'admin-customer-create-address-input' }}
                    FormHelperTextProps={{ 'data-testid': 'admin-customer-create-address-error' }}
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
                    inputProps={{ 'data-testid': 'admin-customer-create-city-input' }}
                    FormHelperTextProps={{ 'data-testid': 'admin-customer-create-city-error' }}
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
                    inputProps={{ 'data-testid': 'admin-customer-create-state-input' }}
                    FormHelperTextProps={{ 'data-testid': 'admin-customer-create-state-error' }}
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
                    inputProps={{ 'data-testid': 'admin-customer-create-postal-code-input' }}
                    FormHelperTextProps={{ 'data-testid': 'admin-customer-create-postal-code-error' }}
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
                    inputProps={{ 'data-testid': 'admin-customer-create-country-input' }}
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
                data-testid="admin-customer-create-submit-btn"
              >
                {loading ? 'Creating...' : 'Create Customer (Deactivated)'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Error Snackbar */}
      <Snackbar
        open={Boolean(serverError)}
        autoHideDuration={6000}
        onClose={() => setServerError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        data-testid="admin-customer-create-snackbar"
      >
        <Alert
          onClose={() => setServerError('')}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {serverError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateCustomerPage;
