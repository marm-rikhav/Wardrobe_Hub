import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Skeleton,
  Avatar,
} from '@mui/material';
import {
  EditOutlined,
  CheckCircleOutline,
  HighlightOffOutlined,
  PhotoCameraOutlined,
  Inventory2Outlined,
} from '@mui/icons-material';

export const ProductTable = ({
  products = [],
  pagination = {},
  loading = false,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onManageImages,
  onToggleStatus,
}) => {
  const { page = 1, limit = 20, total = 0 } = pagination;

  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Variants</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Skeleton variant="rounded" width={44} height={44} />
                      <Box>
                        <Skeleton width={140} height={20} />
                        <Skeleton width={90} height={16} />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Skeleton width={100} height={20} /></TableCell>
                  <TableCell><Skeleton width={80} height={20} /></TableCell>
                  <TableCell align="right"><Skeleton width={70} height={20} sx={{ ml: 'auto' }} /></TableCell>
                  <TableCell align="center"><Skeleton width={40} height={20} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell align="center"><Skeleton width={60} height={20} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell align="right"><Skeleton width={90} height={20} sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (products.length === 0) {
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
        <Inventory2Outlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          No Products Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search or filters, or add a new product to the catalog.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <TableContainer sx={{ maxHeight: 650 }}>
        <Table stickyHeader aria-label="products table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Category / Subcategory</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Brand</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Price</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Variants</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((prod) => {
              const mainImage = prod.images && prod.images.length > 0 ? prod.images[0].imageUrl : null;
              const hasDiscount = prod.discountPrice !== null && prod.discountPrice !== undefined;
              const variantCount = prod.variants?.length || 0;

              return (
                <TableRow
                  key={prod.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    opacity: prod.isActive ? 1 : 0.65,
                  }}
                >
                  {/* Product Name & Thumbnail */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        variant="rounded"
                        src={mainImage || undefined}
                        alt={prod.name}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: 'secondary.main',
                          color: 'secondary.contrastText',
                          fontWeight: 700,
                        }}
                      >
                        {prod.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0, maxWidth: 220 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {prod.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontFamily: 'monospace', display: 'block' }}
                          noWrap
                        >
                          {prod.slug}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Category / Subcategory */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {prod.subcategory?.category?.name || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {prod.subcategory?.name || '—'}
                    </Typography>
                  </TableCell>

                  {/* Brand */}
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {prod.brand || '—'}
                    </Typography>
                  </TableCell>

                  {/* Price */}
                  <TableCell align="right">
                    {hasDiscount ? (
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ color: 'accent.main' }}
                        >
                          ₹{Number(prod.discountPrice).toFixed(2)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                        >
                          ₹{Number(prod.basePrice).toFixed(2)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" fontWeight={600}>
                        ₹{Number(prod.basePrice).toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Variants Count */}
                  <TableCell align="center">
                    <Tooltip title={`${variantCount} variant(s)`}>
                      <Chip
                        size="small"
                        label={variantCount}
                        variant="outlined"
                        sx={{ fontWeight: 600, minWidth: 32 }}
                      />
                    </Tooltip>
                  </TableCell>

                  {/* Status */}
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={prod.isActive ? 'Active' : 'Inactive'}
                      color={prod.isActive ? 'success' : 'default'}
                      sx={{
                        fontWeight: 600,
                        bgcolor: prod.isActive ? 'rgba(47, 125, 79, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                        color: prod.isActive ? '#2F7D4F' : 'text.secondary',
                      }}
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="Manage Images">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => onManageImages(prod)}
                          aria-label={`Images for ${prod.name}`}
                        >
                          <PhotoCameraOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit Product">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEdit(prod)}
                          aria-label={`Edit ${prod.name}`}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={prod.isActive ? 'Deactivate Product' : 'Activate Product'}>
                        <IconButton
                          size="small"
                          color={prod.isActive ? 'error' : 'success'}
                          onClick={() => onToggleStatus(prod)}
                          aria-label={prod.isActive ? `Deactivate ${prod.name}` : `Activate ${prod.name}`}
                        >
                          {prod.isActive ? (
                            <HighlightOffOutlined fontSize="small" />
                          ) : (
                            <CheckCircleOutline fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={total}
        rowsPerPage={limit}
        page={page - 1}
        onPageChange={(e, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
};

export default ProductTable;
