import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import productService from '../../services/productService.js';
import categoryService from '../../services/categoryService.js';
import subcategoryService from '../../services/subcategoryService.js';
import ProductTable from '../../components/products/ProductTable.jsx';
import ProductImageUpload from '../../components/products/ProductImageUpload.jsx';
import DeleteConfirmDialog from '../../components/common/DeleteConfirmDialog.jsx';

export const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Categories & Subcategories for filters
  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);

  // Quick Image Management Dialog
  const [imageModalProduct, setImageModalProduct] = useState(null);

  // Snackbar Notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Load filter lists
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [cats, subs] = await Promise.all([
          categoryService.getAllCategories(),
          subcategoryService.getAllSubcategories(),
        ]);
        setCategories(cats);
        setAllSubcategories(subs);
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to load category filters', 'error');
      }
    };
    loadFilterData();
  }, []);

  // Fetch products with backend pagination and filters
  const fetchProducts = useCallback(
    async (pageToFetch = pagination.page, limitToFetch = pagination.limit) => {
      setLoading(true);
      try {
        const params = {
          page: pageToFetch,
          limit: limitToFetch,
        };

        if (search.trim()) params.search = search.trim();
        if (categoryId) params.categoryId = categoryId;
        if (subcategoryId) params.subcategoryId = subcategoryId;
        if (statusFilter !== 'all') {
          params.isActive = statusFilter === 'active';
        }

        const data = await productService.getAllProducts(params);
        setProducts(data.products || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } catch (err) {
        showSnackbar(
          err.response?.data?.message || 'Failed to fetch products',
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, search, categoryId, subcategoryId, statusFilter]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [search, categoryId, subcategoryId, statusFilter]);

  const handlePageChange = (newPage) => {
    fetchProducts(newPage, pagination.limit);
  };

  const handleRowsPerPageChange = (newLimit) => {
    fetchProducts(1, newLimit);
  };

  const handleEditProduct = (product) => {
    navigate(`/admin/products/${product.id}/edit`);
  };

  const handleToggleStatus = async (product) => {
    const nextStatus = !product.isActive;
    try {
      await productService.toggleProductStatus(product.id, nextStatus);
      showSnackbar(
        `Product "${product.name}" ${nextStatus ? 'activated' : 'deactivated'} successfully!`
      );
      fetchProducts(pagination.page);
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || 'Failed to update product status',
        'error'
      );
    }
  };

  const handleOpenDeleteDialog = (product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingProduct(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      await productService.deleteProduct(deletingProduct.id);
      showSnackbar(`Product "${deletingProduct.name}" deleted successfully!`);
      handleCloseDeleteDialog();
      fetchProducts(pagination.page);
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || 'Failed to delete product',
        'error'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenManageImages = (product) => {
    setImageModalProduct(product);
  };

  const handleCloseManageImages = () => {
    setImageModalProduct(null);
    fetchProducts(pagination.page);
  };

  // Filter subcategories in dropdown based on selected category (cascading dependency)
  const filteredSubcategories = categoryId
    ? allSubcategories.filter((s) => s.categoryId === categoryId)
    : [];

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" component="h1" fontWeight={700} gutterBottom>
            Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your store's apparel and fashion product catalog.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => fetchProducts(pagination.page)}
            disabled={loading}
            sx={{ flexShrink: 0 }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/products/new')}
            sx={{
              flexShrink: 0,
              flexGrow: { xs: 1, sm: 0 },
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Filter and Search Bar */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                placeholder="Search products by name, brand, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} sm={4} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel id="filter-cat-label">Category</InputLabel>
                <Select
                  labelId="filter-cat-label"
                  label="Category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategoryId('');
                  }}
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Subcategory Filter */}
            <Grid item xs={12} sm={4} md={3}>
              <FormControl
                size="small"
                fullWidth
                disabled={!categoryId || filteredSubcategories.length === 0}
              >
                <InputLabel id="filter-subcat-label">
                  {categoryId ? 'Subcategory' : 'Select Category first'}
                </InputLabel>
                <Select
                  labelId="filter-subcat-label"
                  label={categoryId ? 'Subcategory' : 'Select Category first'}
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Subcategories</em>
                  </MenuItem>
                  {filteredSubcategories.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={4} md={2}>
              <FormControl size="small" fullWidth>
                <InputLabel id="filter-status-label">Status</InputLabel>
                <Select
                  labelId="filter-status-label"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Product List Table */}
      <ProductTable
        products={products}
        pagination={pagination}
        loading={loading}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEditProduct}
        onManageImages={handleOpenManageImages}
        onToggleStatus={handleToggleStatus}
        onDelete={handleOpenDeleteDialog}
      />

      {/* Delete Product Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product"
        itemName={deletingProduct ? `${deletingProduct.name} (SKU: ${deletingProduct.variants?.[0]?.sku || 'N/A'})` : ''}
        message="Are you sure you want to permanently delete this product? This action cannot be undone and will permanently remove the product and its variants."
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      {/* Quick Image Management Modal */}
      {imageModalProduct && (
        <Dialog
          open={Boolean(imageModalProduct)}
          onClose={handleCloseManageImages}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 2, p: { xs: 1, sm: 2 } } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Images for "{imageModalProduct.name}"
          </DialogTitle>
          <DialogContent dividers>
            <ProductImageUpload
              productId={imageModalProduct.id}
              images={imageModalProduct.images || []}
              onImagesUpdated={async () => {
                const updated = await productService.getProductById(imageModalProduct.id);
                setImageModalProduct(updated);
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={handleCloseManageImages} variant="contained" color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;
