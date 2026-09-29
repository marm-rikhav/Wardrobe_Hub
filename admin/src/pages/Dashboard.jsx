import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const Dashboard = () => {
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
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to the Wardrobe Hub administration dashboard. Use the navigation sidebar to manage the catalog, products, and inventory.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;
