import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  Typography,
  Skeleton,
  Avatar,
} from '@mui/material';
import {
  EditOutlined,
  WarehouseOutlined,
} from '@mui/icons-material';

export const StockTable = ({
  items = [],
  loading = false,
  onUpdateStock,
}) => {
  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Color</TableCell>
                <TableCell align="center">Current Stock</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Skeleton variant="rounded" width={36} height={36} />
                      <Skeleton width={120} height={20} />
                    </Box>
                  </TableCell>
                  <TableCell><Skeleton width={90} height={20} /></TableCell>
                  <TableCell><Skeleton width={40} height={20} /></TableCell>
                  <TableCell><Skeleton width={60} height={20} /></TableCell>
                  <TableCell align="center"><Skeleton width={50} height={20} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell align="center"><Skeleton width={70} height={20} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell align="right"><Skeleton width={80} height={20} sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (items.length === 0) {
    return (
      <Paper
        sx={{
          p: 5,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <WarehouseOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          No Stock Records Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No product variants match your filters or catalog.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <TableContainer sx={{ maxHeight: 650 }}>
        <Table stickyHeader aria-label="stock table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Size</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Color</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Current Stock</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(({ product, variant }) => {
              const mainImage = product.images && product.images.length > 0 ? product.images[0].imageUrl : null;
              const isOutOfStock = variant.stock === 0;
              const isLowStock = variant.stock > 0 && variant.stock <= 5;

              return (
                <TableRow
                  key={variant.id || `${product.id}-${variant.sku}`}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: isOutOfStock ? 'rgba(192, 57, 43, 0.03)' : 'inherit',
                  }}
                >
                  {/* Product Name & Thumbnail */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        variant="rounded"
                        src={mainImage || undefined}
                        alt={product.name}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: 'secondary.main',
                          color: 'secondary.contrastText',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        {product.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0, maxWidth: 200 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {product.subcategory?.category?.name} &gt; {product.subcategory?.name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* SKU */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {variant.sku}
                    </Typography>
                  </TableCell>

                  {/* Size */}
                  <TableCell>
                    <Typography variant="body2">{variant.size}</Typography>
                  </TableCell>

                  {/* Color */}
                  <TableCell>
                    <Typography variant="body2">{variant.color}</Typography>
                  </TableCell>

                  {/* Current Stock */}
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: isOutOfStock
                          ? 'error.main'
                          : isLowStock
                          ? '#D35400'
                          : 'success.main',
                      }}
                    >
                      {variant.stock} units
                    </Typography>
                  </TableCell>

                  {/* Stock Status Badge */}
                  <TableCell align="center">
                    {isOutOfStock ? (
                      <Chip
                        size="small"
                        label="Out of Stock"
                        color="error"
                        sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                      />
                    ) : isLowStock ? (
                      <Chip
                        size="small"
                        label="Low Stock"
                        sx={{
                          bgcolor: 'rgba(211, 84, 0, 0.12)',
                          color: '#D35400',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label="In Stock"
                        color="success"
                        sx={{
                          bgcolor: 'rgba(47, 125, 79, 0.12)',
                          color: '#2F7D4F',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    )}
                  </TableCell>

                  {/* Action */}
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<EditOutlined />}
                      onClick={() => onUpdateStock({ product, variant })}
                      sx={{ minWidth: 90 }}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default StockTable;
