import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useAuth from '../hooks/useAuth.js';
import { loginSchema } from '../common/validation/authSchemas.js';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  // Redirect target if already authenticated or after login
  const from = location.state?.from?.pathname || '/admin';

  const [showPassword, setShowPassword] = useState(false);
  const [backendError, setBackendError] = useState('');

  // React Hook Form integrated with Zod validation
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
    mode: 'onTouched',
  });

  // If already authenticated and not loading, redirect to admin home
  if (!authLoading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    setBackendError('');

    try {
      await login({
        email: data.email.trim(),
        password: data.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        err.message ||
        'Unable to log in. Please check your credentials and try again.';
      setBackendError(serverMessage);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, sm: 6 },
        px: 2,
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Card
          sx={{
            p: { xs: 2.5, sm: 4 },
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E5DED3',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            {/* Header / Brand */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
                textAlign: 'center',
              }}
            >
              <Box
                component="img"
                src="/wardrobe_hub_logo.svg"
                alt="Wardrobe Hub"
                sx={{
                  height: 48,
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                  mb: 1.5,
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Admin Management Portal
              </Typography>
            </Box>

            {/* Backend Error Alert */}
            {backendError && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  fontSize: '0.875rem',
                  alignItems: 'center',
                }}
                onClose={() => setBackendError('')}
              >
                {backendError}
              </Alert>
            )}

            {/* Login Form using React Hook Form */}
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
              }}
            >
              {/* Email Field */}
              <TextField
                id="admin-email"
                label="Email"
                type="email"
                autoComplete="email"
                autoFocus
                fullWidth
                required
                {...register('email', {
                  onChange: () => {
                    if (backendError) setBackendError('');
                  },
                })}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                disabled={isSubmitting}
                inputProps={{
                  'aria-label': 'Admin Email Address',
                }}
              />

              {/* Password Field */}
              <TextField
                id="admin-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                fullWidth
                required
                {...register('password', {
                  onChange: () => {
                    if (backendError) setBackendError('');
                  },
                })}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                disabled={isSubmitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        onClick={handleTogglePassword}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                        size="medium"
                        tabIndex={0}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  'aria-label': 'Admin Password',
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
                sx={{
                  mt: 1,
                  py: 1.3,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: '#2b2b2b',
                  },
                }}
              >
                {isSubmitting ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <CircularProgress size={20} color="inherit" />
                    <span>Signing in...</span>
                  </Box>
                ) : (
                  'Login to Admin'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
