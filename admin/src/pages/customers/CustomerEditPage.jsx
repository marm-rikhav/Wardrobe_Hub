import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { customerEditSchema } from '../../common/validation/customerSchemas.js';

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

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerEditSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      isActive: true,
      addressId: '',
      addressName: '',
      addressPhone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
  });

  const watchedName = watch('name') || '';
  const watchedEmail = watch('email') || '';
  const watchedIsActive = watch('isActive');
  const watchedAddressId = watch('addressId');

  useEffect(() => {
    if (customer) {
      let defaultAddress = null;
      if (Array.isArray(customer.addresses) && customer.addresses.length > 0) {
        defaultAddress = customer.addresses.find((a) => a.isDefault) || customer.addresses[0];
      }

      reset({
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
  }, [customer, reset]);

  const onFormSubmit = async (data) => {
    setSaveError(null);
    try {
      const hasAnyAddressValue = Boolean(
        data.addressId ||
        data.address?.trim() ||
        data.city?.trim() ||
        data.state?.trim() ||
        data.postalCode?.trim()
      );

      const phoneTrimmed = data.phone ? data.phone.trim() : '';
      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: phoneTrimmed || null,
        isActive: data.isActive,
      };

      if (hasAnyAddressValue) {
        payload.address = {
          id: data.addressId || undefined,
          name: data.addressName?.trim() || data.name.trim(),
          phone: data.addressPhone?.trim() || phoneTrimmed || undefined,
          address: data.address.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          postalCode: data.postalCode.trim(),
          country: data.country?.trim() || 'India',
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
      const rawMsg = err.response?.data?.message;
      const isInternalError =
        typeof rawMsg === 'string' &&
        (rawMsg.includes('prisma.') ||
          rawMsg.includes('passwordHash') ||
          rawMsg.includes('Unknown field') ||
          rawMsg.includes('invocation:'));

      setSaveError(
        isInternalError
          ? 'Failed to update customer details due to a server error. Please try again or contact support.'
          : rawMsg || 'Failed to update customer details.'
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
              {(watchedName || watchedEmail || 'C').charAt(0).toUpperCase()}
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
            label={watchedIsActive ? 'ACTIVE' : 'INACTIVE'}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: watchedIsActive ? 'rgba(47, 125, 79, 0.12)' : 'rgba(192, 57, 43, 0.12)',
              color: watchedIsActive ? '#2F7D4F' : '#C0392B',
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
      <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate>
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
                  {...register('name')}
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
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
                  {...register('email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mobile Phone Number"
                  placeholder="10-digit mobile number (starts with 6-9)"
                  {...register('phone')}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone?.message || 'Optional 10-digit mobile number'}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="success"
                          disabled={saving}
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight={600}>
                          {field.value ? 'Active Account (Allowed to login)' : 'Inactive (Deactivated - login restricted)'}
                        </Typography>
                      }
                    />
                  )}
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
                label={watchedAddressId ? 'EXISTING SAVED ADDRESS' : 'NEW ADDRESS'}
                variant="outlined"
                color={watchedAddressId ? 'primary' : 'default'}
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
                  {...register('addressName')}
                  error={Boolean(errors.addressName)}
                  helperText={errors.addressName?.message}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Delivery Contact Phone"
                  placeholder="10-digit mobile number"
                  {...register('addressPhone')}
                  error={Boolean(errors.addressPhone)}
                  helperText={errors.addressPhone?.message || '10-digit mobile number starting with 6-9'}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Street Address / House No. / Building"
                  placeholder="e.g. 102 Crystal Residency, MG Road"
                  {...register('address')}
                  error={Boolean(errors.address)}
                  helperText={errors.address?.message}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  placeholder="e.g. Mumbai, Surat"
                  {...register('city')}
                  error={Boolean(errors.city)}
                  helperText={errors.city?.message}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="State"
                  placeholder="e.g. Gujarat, Maharashtra"
                  {...register('state')}
                  error={Boolean(errors.state)}
                  helperText={errors.state?.message}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="PIN / Postal Code"
                  placeholder="6-digit PIN code"
                  {...register('postalCode')}
                  error={Boolean(errors.postalCode)}
                  helperText={errors.postalCode?.message}
                  disabled={saving}
                  inputProps={{ maxLength: 6 }}
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
