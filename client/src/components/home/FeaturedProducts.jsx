import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ProductGrid from '../products/ProductGrid.jsx';
import { useProducts } from '../../hooks/useProducts.js';

export const FeaturedProducts = () => {
  const { products, loading } = useProducts({ limit: 4, sort: 'newest' });

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            mb: 4,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.15em' }}
            >
              CURATED SELECTION
            </Typography>
            <Typography variant="h4" component="h2" fontWeight={700}>
              Featured Products
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/products"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            sx={{ fontWeight: 600 }}
          >
            View All Products
          </Button>
        </Box>

        <ProductGrid
          products={products}
          loading={loading}
          skeletonCount={4}
          emptyTitle="New collections arriving soon"
          emptyDescription="We are restocking our latest essentials. Check back shortly or browse other categories."
        />
      </Container>
    </Box>
  );
};

export default FeaturedProducts;
