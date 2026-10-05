import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Box, Chip, Button, IconButton } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  if (!address) return null;

  return (
    <Card
      data-testid="address-card"
      data-address-id={address.id}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: address.isDefault ? '2px solid' : '1px solid',
        borderColor: address.isDefault ? 'secondary.main' : 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700} data-testid="address-card-name">
            {address.name}
          </Typography>
          {address.isDefault && (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
              label="DEFAULT"
              size="small"
              color="secondary"
              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {address.address}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {address.city}, {address.state} — {address.postalCode}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Country: {address.country || 'India'}
        </Typography>

        <Typography variant="body2" color="text.primary" fontWeight={500}>
          Phone: {address.phone}
        </Typography>
      </CardContent>

      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          backgroundColor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {address.isDefault ? (
          <Box />
        ) : (
          <Button
            size="small"
            color="primary"
            data-testid="address-set-default-btn"
            onClick={() => onSetDefault(address.id)}
            sx={{ fontSize: '0.8rem', p: 0 }}
          >
            Set as Default
          </Button>
        )}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" data-testid="address-edit-btn" onClick={() => onEdit(address)} title="Edit Address">
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            data-testid="address-delete-btn"
            onClick={() => onDelete(address.id)}
            title="Delete Address"
          >
            <DeleteOutlineOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

AddressCard.propTypes = {
  address: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    postalCode: PropTypes.string,
    country: PropTypes.string,
    phone: PropTypes.string,
    isDefault: PropTypes.bool,
  }),
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSetDefault: PropTypes.func.isRequired,
};

export default AddressCard;
