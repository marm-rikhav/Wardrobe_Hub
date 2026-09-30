import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Avatar,
  Divider,
} from '@mui/material';
import { PersonOutline, EmailOutlined, PhoneOutlined } from '@mui/icons-material';

export const CustomerInfoCard = ({ customer = null }) => {
  if (!customer) {
    return (
      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Customer details unavailable.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const initial = (customer.name || customer.email || 'C')
    .charAt(0)
    .toUpperCase();

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardHeader
        title="Customer Information"
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
        avatar={
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
              fontWeight: 700,
              width: 36,
              height: 36,
            }}
          >
            {initial}
          </Avatar>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonOutline fontSize="small" sx={{ color: 'text.secondary' }} />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Full Name
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {customer.name || 'N/A'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EmailOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Email Address
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {customer.email || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {customer.phone && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PhoneOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Phone
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {customer.phone}
              </Typography>
            </Box>
          </Box>
        )}

        {customer.id && (
          <Box sx={{ pt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Customer ID
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
            >
              {customer.id}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

CustomerInfoCard.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
  }),
};

export default CustomerInfoCard;
