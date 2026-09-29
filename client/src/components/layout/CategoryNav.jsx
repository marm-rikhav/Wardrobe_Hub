import React from 'react';
import { Box, Container, Chip, Skeleton } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories.js';

export const CategoryNav = () => {
  const { categories, loading } = useCategories();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get('category');

  if (loading) {
    return (
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', py: 0.5 }}>
            <Skeleton variant="rounded" width={70} height={32} />
            <Skeleton variant="rounded" width={60} height={32} />
            <Skeleton variant="rounded" width={80} height={32} />
            <Skeleton variant="rounded" width={60} height={32} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            py: 0.5,
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <Chip
            component={Link}
            to="/products"
            label="All Styles"
            clickable
            color={!activeCategory && location.pathname === '/products' ? 'primary' : 'default'}
            variant={!activeCategory && location.pathname === '/products' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 500, textDecoration: 'none' }}
          />
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <Chip
                key={cat.id}
                component={Link}
                to={`/products?category=${cat.slug}`}
                label={cat.name}
                clickable
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 500,
                  textDecoration: 'none',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                }}
              />
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default CategoryNav;
