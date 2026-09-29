import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import stockService from '../../services/stockService.js';
import categoryService from '../../services/categoryService.js';
import StockTable from '../../components/stock/StockTable.jsx';
import StockUpdateDialog from '../../components/stock/StockUpdateDialog.jsx';

export const Stock = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, in_stock, low_stock, out_of_stock

  // Dialog State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState(null);

  // Feedback Snackbar
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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getAllCategories();
        setCategories(cats);
      } catch (err) {
        showSnackbar('Failed to load categories', 'error');
      }
    };
    loadCategories();
  }, []);

  const fetchStockData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (categoryId) params.categoryId = categoryId;
      const data = await stockService.getStockList(params);
      setProducts(data.products || []);
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || 'Failed to load stock inventory',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  // Flatten product variants for the variant-level stock table
  const variantItems = useMemo(() => {
    const items = [];
    products.forEach((prod) => {
      if (Array.isArray(prod.variants)) {
        prod.variants.forEach((v) => {
          items.push({
            product: prod,
            variant: v,
          });
        });
      }
    });
    return items;
  }, [products]);

  // Apply client-side filters (search and stock health)
  const filteredItems = useMemo(() => {
    let result = variantItems;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.variant.sku.toLowerCase().includes(q) ||
          item.product.name.toLowerCase().includes(q) ||
          item.variant.color.toLowerCase().includes(q) ||
          item.variant.size.toLowerCase().includes(q)
      );
    }

    if (stockFilter === 'out_of_stock') {
      result = result.filter((item) => item.variant.stock === 0);
    } else if (stockFilter === 'low_stock') {
      result = result.filter((item) => item.variant.stock > 0 && item.variant.stock <= 5);
    } else if (stockFilter === 'in_stock') {
      result = result.filter((item) => item.variant.stock > 5);
    }

    return result;
  }, [variantItems, search, stockFilter]);

  const handleOpenUpdate = (record) => {
    setSelectedRecord(record);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRecord(null);
    setDialogError(null);
  };

  const handleSubmitStock = async (newStock) => {
    if (!selectedRecord) return;
    setDialogLoading(true);
    setDialogError(null);

    const { product, variant } = selectedRecord;

    try {
      await stockService.updateVariantStock(product.id, variant, newStock);
      showSnackbar(
        `Stock for SKU "${variant.sku}" updated to ${newStock} units!`
      );
      handleCloseDialog();
      fetchStockData();
    } catch (err) {
      setDialogError(
        err.response?.data?.message || 'Failed to update stock in backend.'
      );
    } finally {
      setDialogLoading(false);
    }
  };

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
            Stock Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage inventory at the product variant level (Size & Color). Stock cannot fall below 0.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchStockData}
          disabled={loading}
          sx={{ flexShrink: 0 }}
        >
          Refresh Stock
        </Button>
      </Box>

      {/* Filter and Search Bar */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12} sm={6} md={5}>
              <TextField
                placeholder="Search by SKU, product name, color, or size..."
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
            <Grid item xs={12} sm={6} md={4}>
              <FormControl size="small" fullWidth>
                <InputLabel id="stock-filter-cat-label">Filter Category</InputLabel>
                <Select
                  labelId="stock-filter-cat-label"
                  label="Filter Category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
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

            {/* Stock Level Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel id="stock-level-label">Stock Status</InputLabel>
                <Select
                  labelId="stock-level-label"
                  label="Stock Status"
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                >
                  <MenuItem value="all">All Inventory</MenuItem>
                  <MenuItem value="in_stock">In Stock (&gt; 5)</MenuItem>
                  <MenuItem value="low_stock">Low Stock (1 - 5)</MenuItem>
                  <MenuItem value="out_of_stock">Out of Stock (0)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <StockTable
        items={filteredItems}
        loading={loading}
        onUpdateStock={handleOpenUpdate}
      />

      {/* Update Stock Dialog */}
      <StockUpdateDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitStock}
        record={selectedRecord}
        loading={dialogLoading}
        error={dialogError}
      />

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

export default Stock;
