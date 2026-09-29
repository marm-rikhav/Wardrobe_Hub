import React, { useEffect } from 'react';
import { Container, Box, Typography, Paper, Link as MuiLink } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profile';

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography
            variant="overline"
            color="secondary.main"
            fontWeight={700}
            letterSpacing="0.1em"
          >
            WELCOME BACK
          </Typography>
          <Typography variant="h5" component="h1" fontWeight={700}>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Access your Wardrobe Hub profile and saved addresses
          </Typography>
        </Box>

        <LoginForm onSuccess={() => navigate(from, { replace: true })} />

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <MuiLink
              component={Link}
              to="/register"
              underline="hover"
              color="primary.main"
              fontWeight={600}
            >
              Register here
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
