import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  Snackbar,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '../../validations/profile.schema.js';
import { useProfile } from '../../hooks/useProfile.js';

export const ProfileForm = () => {
  const { profile, loading, updateProfile } = useProfile();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data) => {
    setSuccessMessage('');
    setErrorMessage('');
    const result = await updateProfile({
      name: data.name,
      phone: data.phone || null,
    });

    if (result.success) {
      setSuccessMessage('Profile updated successfully!');
    } else {
      setErrorMessage(result.message || 'Failed to update profile');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ maxWidth: 540 }}
    >
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        {...register('name')}
        disabled={loading}
      />

      <TextField
        margin="normal"
        fullWidth
        id="email"
        label="Email Address"
        disabled
        helperText="Email cannot be changed"
        {...register('email')}
      />

      <TextField
        margin="normal"
        fullWidth
        id="phone"
        label="Phone Number"
        error={Boolean(errors.phone)}
        helperText={errors.phone?.message}
        {...register('phone')}
        disabled={loading}
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting || !isDirty || loading}
          sx={{ px: 4, py: 1.2, fontWeight: 600 }}
        >
          {isSubmitting ? 'Saving Changes...' : 'Save Profile'}
        </Button>
      </Box>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
};

export default ProfileForm;
