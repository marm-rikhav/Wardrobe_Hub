import React, { useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddressCard from './AddressCard.jsx';
import AddressForm from './AddressForm.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Loading from '../common/Loading.jsx';
import { useAddresses } from '../../hooks/useAddresses.js';

export const AddressList = () => {
  const {
    addresses,
    loading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (address) => {
    setEditingAddress(address);
    setFormError(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingAddress(null);
    setFormError(null);
  };

  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    setFormError(null);
    let result;
    if (editingAddress) {
      result = await updateAddress(editingAddress.id, formData);
    } else {
      result = await addAddress(formData);
    }
    setActionLoading(false);

    if (result.success) {
      handleCloseForm();
    } else {
      setFormError(result.message || 'Operation failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setActionLoading(true);
    await deleteAddress(deleteConfirmId);
    setActionLoading(false);
    setDeleteConfirmId(null);
  };

  if (loading) {
    return <Loading message="Loading address book..." />;
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Address Book
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your saved shipping addresses for faster checkout.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          data-testid="add-new-address-btn"
          sx={{ fontWeight: 600 }}
        >
          Add New Address
        </Button>
      </Box>

      {addresses.length === 0 ? (
        <EmptyState
          title="No addresses saved"
          description="You haven't added any shipping addresses yet. Add an address now to save time on your orders."
          actionLabel="Add Address"
          onAction={handleOpenAdd}
        />
      ) : (
        <Grid container spacing={3}>
          {addresses.map((addr) => (
            <Grid item key={addr.id} xs={12} sm={6} md={6}>
              <AddressCard
                address={addr}
                onEdit={handleOpenEdit}
                onDelete={(id) => setDeleteConfirmId(id)}
                onSetDefault={setDefaultAddress}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add / Edit Dialog */}
      <AddressForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmitAddress={handleFormSubmit}
        initialData={editingAddress}
        isSubmitting={actionLoading}
        error={formError}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteConfirmId)}
        title="Delete Address"
        message="Are you sure you want to remove this address from your address book? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirmId(null)}
        loading={actionLoading}
      />
    </Box>
  );
};

export default AddressList;
