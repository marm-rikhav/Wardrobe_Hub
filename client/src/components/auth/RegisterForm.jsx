import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { registerSchema } from '../../validations/auth.schema.js';
import { useAuth } from '../../hooks/useAuth.js';

export const RegisterForm = ({ onSuccess }) => {
  const { register: registerAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    const { confirmPassword, ...payload } = data;
    const result = await registerAuth(payload);
    if (result.success) {
      if (onSuccess) onSuccess();
    } else {
      setServerError(result.message || 'Registration failed. Please check your information.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        autoComplete="name"
        autoFocus
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        {...register('name')}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        autoComplete="email"
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        {...register('email')}
      />

      <TextField
        margin="normal"
        fullWidth
        id="phone"
        label="Phone Number (Optional)"
        autoComplete="tel"
        inputProps={{
          maxLength: 10,
          inputMode: 'numeric',
          pattern: '[0-9]*',
        }}
        error={Boolean(errors.phone)}
        helperText={errors.phone?.message}
        {...register('phone', {
          onChange: (e) => {
            e.target.value = e.target.value.replaceAll(/\D/g, '').slice(0, 10);
          },
        })}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="new-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register('password')}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        id="confirmPassword"
        autoComplete="new-password"
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={isSubmitting}
        sx={{ mt: 3, mb: 2, py: 1.3, fontWeight: 600 }}
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>
    </Box>
  );
};

RegisterForm.propTypes = {
  onSuccess: PropTypes.func,
};

export default RegisterForm;
