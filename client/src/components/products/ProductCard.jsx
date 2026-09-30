import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters.js';
import { PLACEHOLDER_PRODUCT_IMAGE } from '../../utils/constants.js';

export const ProductCard = ({ product }) => {
  if (!product) return null;

  // Find primary image or first available
  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0].imageUrl
      : PLACEHOLDER_PRODUCT_IMAGE;

  const hasDiscount =
    product.discountPrice && Number(product.discountPrice) < Number(product.basePrice);

  const displayPrice = product.effectivePrice ?? product.discountPrice ?? product.basePrice;

  // Target route can be slug or id
  const targetUrl = `/products/${product.slug || product.id}`;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={targetUrl}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box sx={{ position: 'relative', pt: '125%', width: '100%', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={primaryImage}
            alt={product.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              backgroundColor: 'background.default',
            }}
            onError={(e) => {
              e.target.src = PLACEHOLDER_PRODUCT_IMAGE;
            }}
          />
          {hasDiscount && (
            <Chip
              label="SALE"
              size="small"
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'accent.main',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {product.brand && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              {product.brand}
            </Typography>
          )}

          <Typography
            variant="body1"
            component="h3"
            sx={{
              fontWeight: 600,
              fontSize: '0.95rem',
              lineHeight: 1.3,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6em',
            }}
          >
            {product.name}
          </Typography>

          <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography
              variant="body1"
              sx={{
                color: 'accent.main',
                fontWeight: 700,
                fontSize: '1.05rem',
              }}
            >
              {formatPrice(displayPrice)}
            </Typography>

            {hasDiscount && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'line-through',
                  fontSize: '0.85rem',
                }}
              >
                {formatPrice(product.basePrice)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    slug: PropTypes.string,
    brand: PropTypes.string,
    basePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    discountPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    effectivePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    images: PropTypes.arrayOf(
      PropTypes.shape({
        imageUrl: PropTypes.string,
      })
    ),
    category: PropTypes.shape({
      name: PropTypes.string,
    }),
    variants: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default ProductCard;
