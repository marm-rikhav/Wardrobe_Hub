import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useCategories } from '../../hooks/index.js';
import CategoryTable from '../../components/categories/CategoryTable.jsx';
import CategoryDialog from '../../components/categories/CategoryDialog.jsx';

export const Categories = () => {
  const {
    categories,
    loading,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    toggleCategoryStatus,
  } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState(null);

  // Snackbar Notification State
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

  const handleOpenAddDialog = () => {
    setEditingCategory(null);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (category) => {
    setEditingCategory(category);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setDialogError(null);
  };

  const handleSubmitDialog = async (formData) => {
    setDialogLoading(true);
    setDialogError(null);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        showSnackbar(`Category "${formData.name}" updated successfully!`);
      } else {
        await createCategory(formData);
        showSnackbar(`Category "${formData.name}" created successfully!`);
      }
      handleCloseDialog();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (editingCategory ? 'Failed to update category' : 'Failed to create category');
      setDialogError(msg);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleToggleStatus = async (category) => {
    const nextStatus = !category.isActive;
    try {
      await toggleCategoryStatus(category.id, nextStatus);
      showSnackbar(
        `Category "${category.name}" ${nextStatus ? 'activated' : 'deactivated'} successfully!`
      );
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || 'Failed to update category status',
        'error'
      );
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.slug?.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Page Header */}
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
            Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your store's root product categories and catalog structure.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchCategories}
            disabled={loading}
            sx={{ flexShrink: 0 }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{
              flexShrink: 0,
              flexGrow: { xs: 1, sm: 0 },
            }}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      {/* Filter / Search Bar */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        </CardContent>
      </Card>

      {/* Categories Table */}
      <CategoryTable
        categories={filteredCategories}
        loading={loading}
        onEdit={handleOpenEditDialog}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add / Edit Category Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitDialog}
        category={editingCategory}
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

export default Categories;
