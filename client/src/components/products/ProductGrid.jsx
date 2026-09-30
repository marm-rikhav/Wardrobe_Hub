import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Box, Skeleton } from '@mui/material';
import ProductCard from './ProductCard.jsx';
import EmptyState from '../common/EmptyState.jsx';

export const ProductGrid = ({
  products = [],
  loading = false,
  skeletonCount = 8,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your filters or search terms to find what you are looking for.',
  onResetFilters,
}) => {
  if (loading) {
    const skeletonItems = Array.from({ length: skeletonCount }, (_, i) => `product-skeleton-${i}`);
    return (
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {skeletonItems.map((skeletonId) => (
          <Grid item key={skeletonId} xs={6} sm={4} md={4} lg={3}>
            <Box sx={{ width: '100%' }}>
              <Skeleton
                variant="rectangular"
                sx={{
                  pt: '125%',
                  borderRadius: 1,
                  backgroundColor: 'rgba(191, 168, 138, 0.15)',
                }}
              />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1.5 }} />
              <Skeleton variant="text" width="80%" height={24} />
              <Skeleton variant="text" width="30%" height={28} />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? 'Clear All Filters' : undefined}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
      {products.map((product) => (
        <Grid item key={product.id} xs={6} sm={4} md={4} lg={3}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  skeletonCount: PropTypes.number,
  emptyTitle: PropTypes.node,
  emptyDescription: PropTypes.node,
  onResetFilters: PropTypes.func,
};

export default ProductGrid;
