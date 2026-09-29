import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export const StockStatus = ({ variant, isSelected }) => {
  if (!isSelected) {
    return (
      <Typography variant="body2" color="text.secondary">
        Please select a size and color to check stock availability.
      </Typography>
    );
  }

  if (!variant) {
    return (
      <Chip
        icon={<HighlightOffIcon />}
        label="Combination Unavailable"
        color="default"
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  }

  const stock = variant.stock ?? 0;

  if (stock <= 0) {
    return (
      <Chip
        icon={<HighlightOffIcon />}
        label="Out of Stock"
        color="error"
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  }

  if (stock <= 5) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<WarningAmberIcon />}
          label={`Only ${stock} left in stock - order soon`}
          sx={{
            backgroundColor: '#FFF4E5',
            color: '#B76E00',
            fontWeight: 600,
            '& .MuiChip-icon': { color: '#B76E00' },
          }}
          size="small"
        />
      </Box>
    );
  }

  return (
    <Chip
      icon={<CheckCircleOutlineIcon />}
      label="In Stock"
      color="success"
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
};

export default StockStatus;
