import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Skeleton,
} from '@mui/material';

import {
  AdminPanelSettingsOutlined,
  EmailOutlined,
  BadgeOutlined,
} from '@mui/icons-material';
import { useSettings } from '../hooks/index.js';

export const Settings = () => {
  const { user, loading } = useSettings();

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight={700} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Active administrative session details and credentials.
        </Typography>
      </Box>

      {/* Admin Session Details Card */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box
          sx={{
            p: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <AdminPanelSettingsOutlined sx={{ color: 'accent.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Admin Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Logged-in administrator credentials
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1 }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Logged-in Admin Email */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EmailOutlined sx={{ fontSize: 18, color: 'accent.main' }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase">
                      Admin Email
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600} sx={{ wordBreak: 'break-all' }}>
                    {user?.email || '—'}
                  </Typography>
                </Box>
              </Grid>

              {/* Logged-in Admin Role */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BadgeOutlined sx={{ fontSize: 18, color: 'accent.main' }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary" textTransform="uppercase">
                      System Role
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={user?.role || 'ADMIN'}
                      color="primary"
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;
