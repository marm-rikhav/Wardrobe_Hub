import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardMedia } from '@mui/material';
import { PLACEHOLDER_PRODUCT_IMAGE } from '../../utils/constants.js';

export const ProductGallery = ({ images = [], productName = 'Product' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  const activeImage =
    images && images.length > 0 && images[selectedIndex]
      ? images[selectedIndex].imageUrl
      : PLACEHOLDER_PRODUCT_IMAGE;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Main Image Display */}
      <Card
        sx={{
          position: 'relative',
          pt: '120%',
          width: '100%',
          overflow: 'hidden',
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <CardMedia
          component="img"
          image={activeImage}
          alt={productName}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            e.target.src = PLACEHOLDER_PRODUCT_IMAGE;
          }}
        />
      </Card>

      {/* Thumbnails Row */}
      {images && images.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', py: 0.5 }}>
          {images.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <Box
                key={img.id || idx}
                onClick={() => setSelectedIndex(idx)}
                sx={{
                  width: 72,
                  height: 90,
                  flexShrink: 0,
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: isSelected ? 'secondary.main' : 'divider',
                  opacity: isSelected ? 1 : 0.65,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    opacity: 1,
                    borderColor: 'secondary.main',
                  },
                }}
              >
                <Box
                  component="img"
                  src={img.imageUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_PRODUCT_IMAGE;
                  }}
                />
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

ProductGallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      imageUrl: PropTypes.string,
    })
  ),
  productName: PropTypes.string,
};

export default ProductGallery;
