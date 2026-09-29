import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export const ErrorMessage = ({
  title = 'Something went wrong',
  error,
  onRetry,
  sx = {},
}) => {
  // Extract user-friendly message
  let message = 'An unexpected error occurred. Please try again.';
  if (typeof error === 'string') {
    message = error;
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }

  return (
    <Box sx={{ width: '100%', my: 2, ...sx }}>
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
