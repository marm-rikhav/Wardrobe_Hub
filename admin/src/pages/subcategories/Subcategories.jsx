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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSubcategories } from '../../hooks/index.js';
import SubcategoryTable from '../../components/subcategories/SubcategoryTable.jsx';
import SubcategoryDialog from '../../components/subcategories/SubcategoryDialog.jsx';
import DeleteConfirmDialog from '../../components/common/DeleteConfirmDialog.jsx';

export const Subcategories = () => {
  const {
    subcategories,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    loading,
    refetch: fetchData,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategoryStatus,
  } = useSubcategories();
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState(null);

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSubcategory, setDeletingSubcategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleOpenAddDialog = () => {
    setEditingSubcategory(null);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (subcategory) => {
    setEditingSubcategory(subcategory);
    setDialogError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSubcategory(null);
    setDialogError(null);
  };

  const handleSubmitDialog = async (formData) => {
    setDialogLoading(true);
    setDialogError(null);
    try {
      if (editingSubcategory) {
        await updateSubcategory(editingSubcategory.id, formData);
        showSnackbar(`Subcategory "${formData.name}" updated successfully!`);
      } else {
        await createSubcategory(formData);
        showSnackbar(`Subcategory "${formData.name}" created successfully!`);
      }
      handleCloseDialog();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (editingSubcategory
          ? 'Failed to update subcategory'
          : 'Failed to create subcategory');
      setDialogError(msg);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleToggleStatus = async (subcategory) => {
    const nextStatus = !subcategory.isActive;
    try {
      await toggleSubcategoryStatus(subcategory.id, nextStatus);
      showSnackbar(
        `Subcategory "${subcategory.name}" ${nextStatus ? 'activated' : 'deactivated'} successfully!`
      );
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || 'Failed to update subcategory status',
        'error'
      );
    }
  };

  const handleOpenDeleteDialog = (subcategory) => {
    setDeletingSubcategory(subcategory);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingSubcategory(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubcategory) return;
    setDeleteLoading(true);
    try {
      await deleteSubcategory(deletingSubcategory.id);
      showSnackbar(`Subcategory "${deletingSubcategory.name}" deleted successfully!`);
      handleCloseDeleteDialog();
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || 'Failed to delete subcategory',
        'error'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredSubcategories = useMemo(() => {
    if (!searchQuery.trim()) return subcategories;
    const q = searchQuery.toLowerCase().trim();
    return subcategories.filter(
      (sub) =>
        sub.name.toLowerCase().includes(q) ||
        sub.slug?.toLowerCase().includes(q) ||
        sub.category?.name?.toLowerCase().includes(q)
    );
  }, [subcategories, searchQuery]);

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
            Subcategories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage subcategories linked to parent categories.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
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
            disabled={categories.length === 0}
            sx={{
              flexShrink: 0,
              flexGrow: { xs: 1, sm: 0 },
            }}
          >
            Add Subcategory
          </Button>
        </Box>
      </Box>

      {/* Filter and Search Bar */}
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={8}>
              <TextField
                placeholder="Search subcategories by name or slug..."
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
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl size="small" fullWidth>
                <InputLabel id="filter-category-label">Filter by Category</InputLabel>
                <Select
                  labelId="filter-category-label"
                  label="Filter by Category"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Subcategories Table */}
      <SubcategoryTable
        subcategories={filteredSubcategories}
        loading={loading}
        onEdit={handleOpenEditDialog}
        onToggleStatus={handleToggleStatus}
        onDelete={handleOpenDeleteDialog}
      />

      {/* Add / Edit Subcategory Dialog */}
      <SubcategoryDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitDialog}
        subcategory={editingSubcategory}
        categories={categories}
        loading={dialogLoading}
        error={dialogError}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Subcategory"
        itemName={deletingSubcategory ? `${deletingSubcategory.name} (${deletingSubcategory.category?.name || 'Category'})` : ''}
        message="Are you sure you want to permanently delete this subcategory? This action cannot be undone and will delete the subcategory along with any associated products."
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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

export default Subcategories;
