import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '60vh' : 240,
        gap: 2,
        width: '100%',
      }}
    >
      <CircularProgress color="secondary" size={44} thickness={4} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;
