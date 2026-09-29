import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Divider,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  LogoutOutlined,
  VerifiedUserOutlined,
  SecurityOutlined,
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth.js';
import authService from '../services/authService.js';

export const AdminHome = () => {
  const { user, logout } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const handleVerifyAdmin = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const data = await authService.verifyAdmin();
      setTestResult({
        success: true,
        message: 'Successfully called protected endpoint (/api/auth/admin-check)',
        data,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message:
          err.response?.data?.message ||
          err.message ||
          'Failed to call protected admin endpoint',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" color="primary">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 700, color: 'primary.contrastText' }}
          >
            Wardrobe Hub — Admin Panel
          </Typography>

          <Button
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<LogoutOutlined />}
            onClick={handleLogout}
            disabled={loggingOut}
            sx={{
              borderColor: 'secondary.main',
              color: 'secondary.main',
              '&:hover': {
                borderColor: 'primary.contrastText',
                bgcolor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Card
          sx={{
            p: { xs: 2.5, sm: 4 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid #E5DED3',
          }}
        >
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                  Admin Panel
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Welcome, <strong>{user?.name || user?.email || 'Administrator'}</strong>
                </Typography>
              </Box>

              <Chip
                icon={<SecurityOutlined />}
                label={`Role: ${user?.role || 'ADMIN'}`}
                color="secondary"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* User Details */}
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Session Details
            </Typography>

            <Box
              sx={{
                bgcolor: 'background.default',
                p: 2.5,
                borderRadius: 1.5,
                border: '1px solid #E5DED3',
                mb: 3,
                fontSize: '0.875rem',
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>User ID:</strong> {user?.id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong>{' '}
                <span style={{ color: '#2F7D4F', fontWeight: 600 }}>Active</span>
              </Typography>
            </Box>

            {/* Protected Route Verification Test */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Authentication & Protected Route Verification:
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    testing ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <VerifiedUserOutlined />
                    )
                  }
                  onClick={handleVerifyAdmin}
                  disabled={testing}
                >
                  {testing ? 'Verifying...' : 'Test Protected API Request'}
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  Logout
                </Button>
              </Box>

              {testResult && (
                <Alert
                  severity={testResult.success ? 'success' : 'error'}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {testResult.message}
                  </Typography>
                  {testResult.data && (
                    <Typography
                      variant="caption"
                      component="pre"
                      sx={{ mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                    >
                      {JSON.stringify(testResult.data, null, 2)}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminHome;
