import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

export const NotFound = () => {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
      <Typography
        variant="h1"
        sx={{
          fontWeight: 800,
          color: 'secondary.main',
          fontSize: { xs: '5rem', md: '7rem' },
          lineHeight: 1,
          mb: 2,
        }}
      >
        404
      </Typography>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you are looking for might have been moved, removed, or is temporarily unavailable.
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        color="primary"
        size="large"
        startIcon={<HomeIcon />}
        sx={{ px: 4, py: 1.5, fontWeight: 600 }}
      >
        Back to Home
      </Button>
    </Container>
  );
};

export default NotFound;
