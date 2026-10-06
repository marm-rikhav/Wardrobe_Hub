import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { LocationOnOutlined, PhoneOutlined, PersonOutline } from '@mui/icons-material';

export const DeliveryAddressCard = ({ address = null }) => {
  if (!address) {
    return (
      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Shipping address details unavailable.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardHeader
        title="Delivery Address (Snapshot)"
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
        avatar={<LocationOnOutlined color="primary" />}
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <PersonOutline fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Recipient Name
            </Typography>
            <Typography variant="body2" fontWeight={600} data-testid="admin-order-shipping-name">
              {address.name || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <LocationOnOutlined fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
          <Box data-testid="admin-order-shipping-address">
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Shipping Destination
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {address.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {[address.city, address.state].filter(Boolean).join(', ')}
              {address.postalCode ? ` - ${address.postalCode}` : ''}
            </Typography>
            {address.country && (
              <Typography variant="body2" color="text.secondary">
                {address.country}
              </Typography>
            )}
          </Box>
        </Box>

        {address.phone && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PhoneOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Contact Phone
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {address.phone}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

DeliveryAddressCard.propTypes = {
  address: PropTypes.shape({
    name: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    postalCode: PropTypes.string,
    country: PropTypes.string,
  }),
};

export default DeliveryAddressCard;
