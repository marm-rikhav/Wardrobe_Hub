import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const Customers = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        sx={{
          p: { xs: 2.5, sm: 4 },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Customers
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customer management section. This feature will be implemented in a future phase.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Customers;
