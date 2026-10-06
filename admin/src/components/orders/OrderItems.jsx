import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { ShoppingBagOutlined } from '@mui/icons-material';
import { formatCurrency } from '../../utils/orderConstants.js';

export const OrderItems = ({ items = [] }) => {
  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
      <CardHeader
        title={`Ordered Items (${items.length})`}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
        avatar={<ShoppingBagOutlined color="primary" />}
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <TableContainer>
          <Table size="medium" aria-label="order items snapshot table">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Color</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  Price (Snapshot)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  Qty
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  Subtotal
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const initial = (item.productName || 'P').charAt(0).toUpperCase();

                return (
                  <TableRow key={item.id} hover data-testid="admin-order-item-row">
                    {/* Item Thumbnail & Name Snapshot */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          variant="rounded"
                          src={item.imageUrl || undefined}
                          alt={item.productName}
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: 'secondary.main',
                            color: 'secondary.contrastText',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                          }}
                        >
                          {initial}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} data-testid="admin-order-item-name">
                            {item.productName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* SKU */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        data-testid="admin-order-item-sku"
                        sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                      >
                        {item.sku || '—'}
                      </Typography>
                    </TableCell>

                    {/* Size */}
                    <TableCell>
                      <Typography variant="body2">{item.size}</Typography>
                    </TableCell>

                    {/* Color */}
                    <TableCell>
                      <Typography variant="body2">{item.color}</Typography>
                    </TableCell>

                    {/* Unit Price Snapshot */}
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        {formatCurrency(item.unitPrice)}
                      </Typography>
                    </TableCell>

                    {/* Quantity */}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600} data-testid="admin-order-item-qty">
                        {item.quantity}
                      </Typography>
                    </TableCell>

                    {/* Subtotal */}
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: 'accent.main' }}
                      >
                        {formatCurrency(item.subtotal)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

OrderItems.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      productName: PropTypes.string,
      sku: PropTypes.string,
      size: PropTypes.string,
      color: PropTypes.string,
      unitPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      quantity: PropTypes.number,
      subtotal: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      imageUrl: PropTypes.string,
    })
  ),
};

export default OrderItems;
