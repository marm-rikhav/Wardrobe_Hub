import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Button,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import productApi from '../../api/product.api.js';
import ProductGallery from '../../components/products/ProductGallery.jsx';
import VariantSelector from '../../components/products/VariantSelector.jsx';
import StockStatus from '../../components/products/StockStatus.jsx';
import Loading from '../../components/common/Loading.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { formatPrice } from '../../utils/formatters.js';

export const ProductDetail = () => {
  const { id } = useParams(); // Can be slug or id
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Variant selection state
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productApi.getProductBySlug(id);
        const prod = response.data?.product;
        setProduct(prod);

        // Pre-select first available variant if present
        if (prod?.variants && prod.variants.length > 0) {
          const firstInStock =
            prod.variants.find((v) => (v.stock ?? 0) > 0) || prod.variants[0];
          setSelectedSize(firstInStock.size);
          setSelectedColor(firstInStock.color);
          setSelectedVariant(firstInStock);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Synchronize variant matching whenever size or color changes
  useEffect(() => {
    if (!product || !product.variants) return;

    if (selectedSize && selectedColor) {
      const match = product.variants.find(
        (v) =>
          v.size.toLowerCase() === selectedSize.toLowerCase() &&
          v.color.toLowerCase() === selectedColor.toLowerCase()
      );
      setSelectedVariant(match || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedSize, selectedColor, product]);

  if (loading) {
    return <Loading message="Loading product details..." fullScreen />;
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <ErrorMessage
          title="Product Unavailable"
          error={error || 'Could not load this product.'}
        />
        <Button component={Link} to="/products" variant="contained" sx={{ mt: 2 }}>
          Back to Catalog
        </Button>
      </Container>
    );
  }

  // Price calculations: variant-level custom price takes precedence if present
  const displayPrice =
    selectedVariant?.effectivePrice ??
    product.effectivePrice ??
    product.discountPrice ??
    product.basePrice;

  const hasDiscount =
    product.discountPrice && Number(product.discountPrice) < Number(product.basePrice);

  const isOutOfStock = Boolean(selectedVariant && (selectedVariant.stock ?? 0) <= 0);
  const isCombinationUnavailable = Boolean(selectedSize && selectedColor && !selectedVariant);

  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <MuiLink
            component={Link}
            to="/"
            underline="hover"
            color="inherit"
            fontSize="0.875rem"
          >
            Home
          </MuiLink>
          <MuiLink
            component={Link}
            to="/products"
            underline="hover"
            color="inherit"
            fontSize="0.875rem"
          >
            Shop
          </MuiLink>
          {product.subcategory?.category && (
            <MuiLink
              component={Link}
              to={`/products?category=${product.subcategory.category.slug || product.subcategory.category.id}`}
              underline="hover"
              color="inherit"
              fontSize="0.875rem"
            >
              {product.subcategory.category.name}
            </MuiLink>
          )}
          {product.subcategory && (
            <MuiLink
              component={Link}
              to={`/products?subcategory=${product.subcategory.slug || product.subcategory.id}`}
              underline="hover"
              color="inherit"
              fontSize="0.875rem"
            >
              {product.subcategory.name}
            </MuiLink>
          )}
          <Typography color="text.primary" fontSize="0.875rem" fontWeight={600} noWrap>
            {product.name}
          </Typography>
        </Breadcrumbs>

        {/* Product Layout: Left Gallery | Right Details */}
        <Grid container spacing={{ xs: 3, md: 6 }}>
          {/* Gallery */}
          <Grid item xs={12} md={6}>
            <ProductGallery images={product.images} productName={product.name} />
          </Grid>

          {/* Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Brand & Title */}
              <Box>
                {product.brand && (
                  <Typography
                    variant="caption"
                    color="secondary.main"
                    sx={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      fontWeight: 700,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    {product.brand}
                  </Typography>
                )}
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight={700}
                  letterSpacing="-0.01em"
                >
                  {product.name}
                </Typography>
              </Box>

              {/* Price section */}
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: 'accent.main',
                    fontWeight: 700,
                    fontSize: '1.8rem',
                  }}
                >
                  {formatPrice(displayPrice)}
                </Typography>

                {hasDiscount && (
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'line-through',
                      fontSize: '1.1rem',
                    }}
                  >
                    {formatPrice(product.basePrice)}
                  </Typography>
                )}

                {hasDiscount && (
                  <Chip
                    label="SALE"
                    size="small"
                    color="secondary"
                    sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                  />
                )}
              </Box>

              <Divider />

              {/* Variant Selector: Size & Color */}
              <VariantSelector
                variants={product.variants || []}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSelectSize={setSelectedSize}
                onSelectColor={setSelectedColor}
              />

              {/* Inventory Stock Status */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1,
                  }}
                >
                  <StockStatus
                    variant={selectedVariant}
                    isSelected={Boolean(selectedSize && selectedColor)}
                  />

                  {selectedVariant?.sku && (
                    <Typography variant="caption" color="text.secondary">
                      SKU: <strong>{selectedVariant.sku}</strong>
                    </Typography>
                  )}
                </Box>
              </Paper>

              {/* Add to Cart (Phase 6 placeholder) */}
              <Box sx={{ mt: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={
                    !selectedVariant ||
                    isOutOfStock ||
                    isCombinationUnavailable
                  }
                  startIcon={<ShoppingBagOutlinedIcon />}
                  sx={{
                    py: 1.8,
                    fontWeight: 600,
                    fontSize: '1rem',
                    backgroundColor: 'primary.main',
                  }}
                >
                  {isCombinationUnavailable
                    ? 'Variant Unavailable'
                    : isOutOfStock
                    ? 'Out of Stock'
                    : 'Add to Cart (Coming in Phase 6)'}
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                >
                  Free shipping on orders over ₹1,999 · 14-day hassle-free returns
                </Typography>
              </Box>

              <Divider />

              {/* Description */}
              {product.description && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Description & Details
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.75, whiteSpace: 'pre-line' }}
                  >
                    {product.description}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductDetail;
