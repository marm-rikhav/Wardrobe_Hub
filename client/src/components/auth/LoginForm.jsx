import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import { loginSchema } from '../../validations/auth.schema.js';
import { useAuth } from '../../hooks/useAuth.js';

export const LoginForm = ({ onSuccess }) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    const result = await login(data);
    if (result.success) {
      if (onSuccess) onSuccess();
    } else {
      setServerError(result.message || 'Invalid email or password');
    }
  };

  const isDeactivated = serverError.toLowerCase().includes('deactivated');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      {serverError && isDeactivated && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Box sx={{ fontWeight: 600, mb: 0.5 }}>Account Deactivated</Box>
          <Box sx={{ mb: 1.5, fontSize: '0.875rem' }}>{serverError}</Box>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            href="mailto:admin@wardrobehub.com?subject=Account%20Reactivation%20Request"
            startIcon={<EmailOutlined />}
          >
            Email Admin
          </Button>
        </Alert>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={Boolean(serverError && !isDeactivated)}
        autoHideDuration={6000}
        onClose={() => setServerError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setServerError('')}
          severity="error"
          variant="filled"
          data-testid="login-error-alert"
          sx={{ width: '100%' }}
        >
          {serverError}
        </Alert>
      </Snackbar>

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        autoComplete="email"
        autoFocus
        inputProps={{ 'data-testid': 'login-email-input' }}
        FormHelperTextProps={{ 'data-testid': 'login-email-error' }}
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        {...register('email')}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        inputProps={{ 'data-testid': 'login-password-input' }}
        FormHelperTextProps={{ 'data-testid': 'login-password-error' }}
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register('password')}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                data-testid="toggle-password-visibility-btn"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disabled={isSubmitting}
        data-testid="login-submit-btn"
        sx={{ mt: 3, mb: 2, py: 1.3, fontWeight: 600 }}
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </Box>
  );
};

LoginForm.propTypes = {
  onSuccess: PropTypes.func,
};

export default LoginForm;
