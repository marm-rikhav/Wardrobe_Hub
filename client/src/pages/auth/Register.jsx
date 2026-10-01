import React, { useEffect } from 'react';
import { Container, Box, Typography, Paper, Link as MuiLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export const Register = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/products', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

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
            JOIN WARDROBE HUB
          </Typography>
          <Typography variant="h5" component="h1" fontWeight={700}>
            Create an Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Enjoy personalized shopping and exclusive styles
          </Typography>
        </Box>

        <RegisterForm onSuccess={() => navigate('/products', { replace: true })} />

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <MuiLink
              component={Link}
              to="/login"
              underline="hover"
              color="primary.main"
              fontWeight={600}
            >
              Sign In
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
