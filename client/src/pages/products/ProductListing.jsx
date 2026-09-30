import React, { useState, useMemo } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Drawer,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { useSearchParams, Link } from 'react-router-dom';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ProductGrid from '../../components/products/ProductGrid.jsx';
import ProductFilters from '../../components/products/ProductFilters.jsx';
import ProductSearch from '../../components/products/ProductSearch.jsx';
import ProductSort from '../../components/products/ProductSort.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { useProducts } from '../../hooks/useProducts.js';
import { useCategories } from '../../hooks/useCategories.js';
import { DEFAULT_PAGE_LIMIT } from '../../utils/constants.js';

export const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract query parameters from URL
  const queryParams = useMemo(() => {
    return {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      subcategory: searchParams.get('subcategory') || '',
      size: searchParams.get('size') || '',
      color: searchParams.get('color') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || 'newest',
      page: Number.parseInt(searchParams.get('page') || '1', 10),
      limit: DEFAULT_PAGE_LIMIT,
    };
  }, [searchParams]);

  const { products, pagination, loading } = useProducts(queryParams);
  const { categories } = useCategories();

  // Helper to update URL search parameters safely
  const updateQuery = (newUpdates, resetPage = true) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(newUpdates).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(val));
      }
    });

    if (resetPage) {
      nextParams.delete('page');
    }

    setSearchParams(nextParams);
  };

  const handleFilterChange = (filters) => {
    updateQuery(filters, true);
    setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setMobileFilterOpen(false);
  };

  const handleSearchChange = (keyword) => {
    updateQuery({ search: keyword }, true);
  };

  const handleSortChange = (newSort) => {
    updateQuery({ sort: newSort }, false);
  };

  const handlePageChange = (newPage) => {
    updateQuery({ page: newPage }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find active category title for breadcrumbs / heading
  const currentCategory = categories.find((c) => c.slug === queryParams.category);
  const title = currentCategory ? currentCategory.name : 'All Products';

  return (
    <Box sx={{ py: { xs: 3, md: 5 } }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2.5 }}
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
          {currentCategory ? (
            <MuiLink
              component={Link}
              to="/products"
              underline="hover"
              color="inherit"
              fontSize="0.875rem"
            >
              Catalog
            </MuiLink>
          ) : (
            <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>
              All Products
            </Typography>
          )}
          {currentCategory && (
            <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>
              {currentCategory.name}
            </Typography>
          )}
        </Breadcrumbs>

        {/* Page Title & Search / Sort Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {pagination.total} {pagination.total === 1 ? 'item' : 'items'} available
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box sx={{ width: { xs: '100%', sm: 260 } }}>
              <ProductSearch
                value={queryParams.search}
                onChange={handleSearchChange}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                width: { xs: '100%', sm: 'auto' },
                justifyContent: 'space-between',
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<TuneIcon />}
                onClick={() => setMobileFilterOpen(true)}
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  flexGrow: { xs: 1, sm: 0 },
                  backgroundColor: 'background.paper',
                }}
              >
                Filters
              </Button>

              <ProductSort
                value={queryParams.sort}
                onChange={handleSortChange}
                sx={{ flexGrow: { xs: 1, sm: 0 } }}
              />
            </Box>
          </Box>
        </Box>

        {/* Layout: Sidebar Filters | Product Grid */}
        <Grid container spacing={4}>
          {/* Desktop Filters Sidebar */}
          <Grid item md={3.2} lg={2.8} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 90 }}>
              <ProductFilters
                categories={categories}
                selectedCategory={queryParams.category}
                selectedSubcategory={queryParams.subcategory}
                selectedSize={queryParams.size}
                selectedColor={queryParams.color}
                minPrice={queryParams.minPrice}
                maxPrice={queryParams.maxPrice}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </Box>
          </Grid>

          {/* Product Grid Area */}
          <Grid item xs={12} md={8.8} lg={9.2}>
            <ProductGrid
              products={products}
              loading={loading}
              skeletonCount={queryParams.limit}
              onResetFilters={handleResetFilters}
            />

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onChange={handlePageChange}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        PaperProps={{
          sx: {
            width: '85%',
            maxWidth: 360,
            p: 2,
            backgroundColor: 'background.default',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Filters
          </Typography>
          <IconButton onClick={() => setMobileFilterOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <ProductFilters
          categories={categories}
          selectedCategory={queryParams.category}
          selectedSubcategory={queryParams.subcategory}
          selectedSize={queryParams.size}
          selectedColor={queryParams.color}
          minPrice={queryParams.minPrice}
          maxPrice={queryParams.maxPrice}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
      </Drawer>
    </Box>
  );
};

export default ProductListing;
