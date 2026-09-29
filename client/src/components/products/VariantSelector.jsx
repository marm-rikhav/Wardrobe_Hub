import React, { useMemo } from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';

export const VariantSelector = ({
  variants = [],
  selectedSize,
  selectedColor,
  onSelectSize,
  onSelectColor,
}) => {
  // Extract unique available sizes and colors
  const { sizes, colors } = useMemo(() => {
    const sSet = new Set();
    const cSet = new Set();
    variants.forEach((v) => {
      if (v.size) sSet.add(v.size);
      if (v.color) cSet.add(v.color);
    });
    return {
      sizes: Array.from(sSet),
      colors: Array.from(cSet),
    };
  }, [variants]);

  // Check if a specific size is available for the currently selected color
  const isSizeAvailable = (size) => {
    if (!selectedColor) {
      return variants.some((v) => v.size === size && (v.stock ?? 0) > 0);
    }
    return variants.some(
      (v) =>
        v.size === size &&
        v.color.toLowerCase() === selectedColor.toLowerCase() &&
        (v.stock ?? 0) > 0
    );
  };

  // Check if a specific color is available for the currently selected size
  const isColorAvailable = (color) => {
    if (!selectedSize) {
      return variants.some(
        (v) => v.color.toLowerCase() === color.toLowerCase() && (v.stock ?? 0) > 0
      );
    }
    return variants.some(
      (v) =>
        v.size === selectedSize &&
        v.color.toLowerCase() === color.toLowerCase() &&
        (v.stock ?? 0) > 0
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Color Selection */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Color:
          </Typography>
          <Typography variant="body2" color="secondary.main" fontWeight={600}>
            {selectedColor || 'Select a color'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {colors.map((color) => {
            const isSelected =
              selectedColor && selectedColor.toLowerCase() === color.toLowerCase();
            const available = isColorAvailable(color);

            return (
              <Chip
                key={color}
                label={color}
                clickable
                onClick={() => onSelectColor(color)}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                disabled={!available && !isSelected}
                sx={{
                  fontWeight: isSelected ? 700 : 500,
                  px: 1,
                  py: 2,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  textDecoration: !available ? 'line-through' : 'none',
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Size Selection */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Size:
          </Typography>
          <Typography variant="body2" color="secondary.main" fontWeight={600}>
            {selectedSize || 'Select a size'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {sizes.map((size) => {
            const isSelected = selectedSize === size;
            const available = isSizeAvailable(size);

            return (
              <Button
                key={size}
                variant={isSelected ? 'contained' : 'outlined'}
                color={isSelected ? 'primary' : 'inherit'}
                onClick={() => onSelectSize(size)}
                disabled={!available && !isSelected}
                sx={{
                  minWidth: 48,
                  height: 44,
                  px: 2,
                  fontWeight: isSelected ? 700 : 500,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  textDecoration: !available ? 'line-through' : 'none',
                  opacity: !available ? 0.45 : 1,
                }}
              >
                {size}
              </Button>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default VariantSelector;
