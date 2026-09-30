import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  IconButton,
  ButtonGroup,
  Button,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { formatPrice } from '../../utils/formatters.js';

export const CartItemRow = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
  isRemoving = false,
}) => {
  if (!item) return null;

  const handleDecrement = () => {
    if (item.quantity > 1 && !isUpdating) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (item.quantity < item.stock && !isUpdating) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };

  const isMaxStockReached = item.quantity >= item.stock;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
      }}
    >
      {/* Product Image */}
      <Box
        component={Link}
        to={`/products/${item.productSlug || item.productId}`}
        sx={{
          width: { xs: 80, sm: 96 },
          height: { xs: 100, sm: 120 },
          borderRadius: 1,
          overflow: 'hidden',
          backgroundColor: '#f0ece6',
          flexShrink: 0,
          display: 'block',
        }}
      >
        {item.imageUrl ? (
          <Box
            component="img"
            src={item.imageUrl}
            alt={item.productName}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            No Image
          </Box>
        )}
      </Box>

      {/* Product Info */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          component={Link}
          to={`/products/${item.productSlug || item.productId}`}
          variant="subtitle1"
          fontWeight={600}
          sx={{
            textDecoration: 'none',
            color: 'text.primary',
            '&:hover': { color: 'secondary.main' },
            display: 'block',
            lineHeight: 1.3,
            mb: 0.5,
          }}
        >
          {item.productName}
        </Typography>

        {/* Variant chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            size="small"
            label={`Size: ${item.size}`}
            variant="outlined"
            sx={{ borderRadius: 1, fontSize: '0.75rem' }}
          />
          <Chip
            size="small"
            label={`Color: ${item.color}`}
            variant="outlined"
            sx={{ borderRadius: 1, fontSize: '0.75rem' }}
          />
        </Box>

        {/* Unit Price */}
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
        >
          Unit Price: <strong>{formatPrice(item.price)}</strong>
        </Typography>

        {/* Stock warning */}
        {item.stock <= 5 && item.stock > 0 && (
          <Typography
            variant="caption"
            sx={{ color: 'warning.main', fontWeight: 600, display: 'block', mt: 0.5 }}
          >
            Only {item.stock} left in stock
          </Typography>
        )}
      </Box>

      {/* Quantity Controls & Subtotal */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'space-between', sm: 'flex-end' },
          width: { xs: '100%', sm: 'auto' },
          gap: { xs: 2, sm: 3 },
          flexShrink: 0,
        }}
      >
        {/* Quantity Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ButtonGroup
            size="small"
            variant="outlined"
            sx={{
              borderColor: 'divider',
              '& .MuiButton-root': {
                borderColor: 'divider',
                color: 'text.primary',
                minWidth: 32,
                px: 1,
              },
            }}
          >
            <Button
              onClick={handleDecrement}
              disabled={item.quantity <= 1 || isUpdating || isRemoving}
              aria-label="decrease quantity"
            >
              <RemoveIcon fontSize="small" />
            </Button>
            <Button
              disabled
              sx={{
                fontWeight: 600,
                color: 'text.primary !important',
                minWidth: 40,
                cursor: 'default',
              }}
            >
              {isUpdating ? <CircularProgress size={16} /> : item.quantity}
            </Button>
            <Button
              onClick={handleIncrement}
              disabled={isMaxStockReached || isUpdating || isRemoving}
              aria-label="increase quantity"
            >
              <AddIcon fontSize="small" />
            </Button>
          </ButtonGroup>
        </Box>

        {/* Item Subtotal */}
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            color: 'accent.main',
            minWidth: 80,
            textAlign: 'right',
            fontSize: '1.05rem',
          }}
        >
          {formatPrice(item.subtotal)}
        </Typography>

        {/* Remove Button */}
        <IconButton
          color="error"
          onClick={() => onRemove(item.id)}
          disabled={isRemoving || isUpdating}
          size="small"
          title="Remove item"
          aria-label="remove item"
          sx={{ p: 1 }}
        >
          {isRemoving ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <DeleteOutlineOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
    </Paper>
  );
};

CartItemRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    productId: PropTypes.string,
    productSlug: PropTypes.string,
    productName: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
    subtotal: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  isUpdating: PropTypes.bool,
  isRemoving: PropTypes.bool,
};

export default CartItemRow;
