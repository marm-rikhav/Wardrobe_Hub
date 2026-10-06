import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
  CategoryOutlined,
} from '@mui/icons-material';

export const CategoryTable = ({
  categories = [],
  loading = false,
  onEdit,
  onToggleStatus,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset to first page when categories change (e.g. search filter)
  useEffect(() => {
    setPage(0);
  }, [categories.length]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedCategories = categories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell align="center">Subcategories</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Skeleton variant="circular" width={36} height={36} />
                      <Skeleton width={120} height={24} />
                    </Box>
                  </TableCell>
                  <TableCell><Skeleton width={100} height={24} /></TableCell>
                  <TableCell align="center"><Skeleton width={40} height={24} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell align="center"><Skeleton width={60} height={24} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell align="right"><Skeleton width={80} height={24} sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (categories.length === 0) {
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
        <CategoryOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          No Categories Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No categories match your search, or no categories have been created yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="categories table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Slug</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                Subcategories
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                Status
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedCategories.map((cat) => (
              <TableRow
                key={cat.id}
                hover
                data-testid="admin-category-row"
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  opacity: cat.isActive ? 1 : 0.65,
                }}
              >
                {/* Category Name & Avatar */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={cat.imageUrl || undefined}
                      alt={cat.name}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: 'secondary.main',
                        color: 'secondary.contrastText',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    >
                      {cat.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} data-testid="admin-category-name">
                        {cat.name}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Slug */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }} data-testid="admin-category-slug">
                    {cat.slug}
                  </Typography>
                </TableCell>

                {/* Subcategories Count */}
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={cat._count?.subcategories ?? 0}
                    variant="outlined"
                    sx={{ fontWeight: 600, minWidth: 32 }}
                  />
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={cat.isActive ? 'Active' : 'Inactive'}
                    color={cat.isActive ? 'success' : 'default'}
                    data-testid="admin-category-status-chip"
                    sx={{
                      fontWeight: 600,
                      bgcolor: cat.isActive ? 'rgba(47, 125, 79, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                      color: cat.isActive ? '#2F7D4F' : 'text.secondary',
                    }}
                  />
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Edit category">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(cat)}
                        aria-label={`Edit ${cat.name}`}
                        data-testid="admin-category-edit-btn"
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={cat.isActive ? 'Deactivate category' : 'Activate category'}>
                      <IconButton
                        size="small"
                        color={cat.isActive ? 'error' : 'success'}
                        onClick={() => onToggleStatus(cat)}
                        aria-label={cat.isActive ? `Deactivate ${cat.name}` : `Activate ${cat.name}`}
                        data-testid="admin-category-toggle-status-btn"
                      >
                        {cat.isActive ? (
                          <HighlightOffOutlined fontSize="small" />
                        ) : (
                          <CheckCircleOutline fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={categories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

CategoryTable.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      isActive: PropTypes.bool,
      _count: PropTypes.shape({
        subcategories: PropTypes.number,
      }),
    })
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
};

export default CategoryTable;
