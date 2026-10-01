import React, { useEffect, useRef } from 'react';
import { Container, Box, Typography, Paper, Link as MuiLink } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LoginForm from '../../components/auth/LoginForm.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { addToCart } from '../../store/cart/cartThunks.js';

export const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const actionProcessedRef = useRef(false);

  const fromPath = location.state?.from?.pathname;
  const from = fromPath && !fromPath.startsWith('/profile') ? fromPath : '/products';
  const postLoginAction = location.state?.postLoginAction;

  const handlePostAuthRedirect = async () => {
    if (actionProcessedRef.current) return;
    actionProcessedRef.current = true;

    if (postLoginAction?.variantId) {
      try {
        await dispatch(
          addToCart({
            variantId: postLoginAction.variantId,
            quantity: postLoginAction.quantity || 1,
          })
        ).unwrap();
      } catch (err) {
        console.error('Failed to add pending product to cart:', err);
      }

      navigate(postLoginAction.redirectTo || '/cart', { replace: true });
      return;
    }

    navigate(from, { replace: true });
  };

  useEffect(() => {
    if (!loading && isAuthenticated && !actionProcessedRef.current) {
      void handlePostAuthRedirect();
    }
  }, [isAuthenticated, loading]);

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

        <LoginForm onSuccess={() => void handlePostAuthRedirect()} />

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <MuiLink
              component={Link}
              to="/register"
              state={location.state}
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
