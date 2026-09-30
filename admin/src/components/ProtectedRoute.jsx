import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import useAuth from '../hooks/useAuth.js';

/**
 * Route wrapper that ensures the user is authenticated with ADMIN role.
 * Shows loading spinner while verifying token / refresh cookie.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress color="primary" size={40} />
        <Typography variant="body2" color="text.secondary">
          Verifying administrator credentials...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ?? <Outlet />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

export default ProtectedRoute;
