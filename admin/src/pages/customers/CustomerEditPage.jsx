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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useCustomer } from '../../hooks/index.js';
import NotFound from '../NotFound.jsx';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_10_DIGIT_REGEX = /^\d{10}$/;

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
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        isActive: typeof customer.isActive === 'boolean' ? customer.isActive : true,
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

    const nameVal = formData.name.trim();
    if (!nameVal) {
      newErrors.name = 'Name is required';
    } else if (nameVal.length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    } else if (nameVal.length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    const emailVal = formData.email.trim();
    if (!emailVal) {
      newErrors.email = 'Email is required';
    } else if (emailVal.length > 150) {
      newErrors.email = 'Email cannot exceed 150 characters';
    } else if (!EMAIL_REGEX.test(emailVal.toLowerCase())) {
      newErrors.email = 'Invalid email address format';
    }

    const phoneVal = formData.phone.trim();
    if (phoneVal && !PHONE_10_DIGIT_REGEX.test(phoneVal)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaveError(null);
    try {
      await updateCustomer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        isActive: formData.isActive,
      });

      navigate(`/admin/customers/${id}`, {
        state: {
          message: 'Customer profile updated successfully.',
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
    <Box sx={{ width: '100%', maxWidth: 850, mx: 'auto', pb: 6 }}>
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
                width: 48,
                height: 48,
                fontWeight: 700,
              }}
            >
              {(formData.name || formData.email || 'C').charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1" fontWeight={700}>
                Edit Customer
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Customer ID: {id}
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

      {/* Edit Form Card */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 2, letterSpacing: 0.5 }}>
              CUSTOMER INFORMATION
            </Typography>

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
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="10-digit mobile number"
                  error={Boolean(errors.phone)}
                  helperText={errors.phone || 'Optional, exactly 10 digits'}
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleInputChange('isActive')}
                      color="success"
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

            <Divider sx={{ my: 3 }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
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
                sx={{ px: 3, fontWeight: 600 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerEditPage;
