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
} from '@mui/material';
import {
  EditOutlined,
  CheckCircleOutline,
  HighlightOffOutlined,
  DeleteOutline,
  AccountTreeOutlined,
} from '@mui/icons-material';

export const SubcategoryTable = ({
  subcategories = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset to first page when subcategories change (e.g. category filter or search)
  useEffect(() => {
    setPage(0);
  }, [subcategories.length]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const displayedSubcategories = subcategories.slice(
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
                <TableCell>Subcategory</TableCell>
                <TableCell>Parent Category</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell align="center">Products</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((key) => (
                <TableRow key={key}>
                  <TableCell><Skeleton width={140} height={24} /></TableCell>
                  <TableCell><Skeleton width={110} height={24} /></TableCell>
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

  if (subcategories.length === 0) {
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
        <AccountTreeOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          No Subcategories Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No subcategories match your selection, or none have been created yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="subcategories table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Subcategory</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Parent Category</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Slug</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                Products
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
            {displayedSubcategories.map((sub) => (
              <TableRow
                key={sub.id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  opacity: sub.isActive ? 1 : 0.65,
                }}
              >
                {/* Name */}
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {sub.name}
                  </Typography>
                </TableCell>

                {/* Parent Category */}
                <TableCell>
                  <Chip
                    size="small"
                    label={sub.category?.name || 'Unassigned'}
                    color="secondary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>

                {/* Slug */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {sub.slug}
                  </Typography>
                </TableCell>

                {/* Products Count */}
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={sub._count?.products ?? 0}
                    variant="outlined"
                    sx={{ fontWeight: 600, minWidth: 32 }}
                  />
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={sub.isActive ? 'Active' : 'Inactive'}
                    color={sub.isActive ? 'success' : 'default'}
                    sx={{
                      fontWeight: 600,
                      bgcolor: sub.isActive ? 'rgba(47, 125, 79, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                      color: sub.isActive ? '#2F7D4F' : 'text.secondary',
                    }}
                  />
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Edit subcategory">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(sub)}
                        aria-label={`Edit ${sub.name}`}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={sub.isActive ? 'Deactivate subcategory' : 'Activate subcategory'}>
                      <IconButton
                        size="small"
                        color={sub.isActive ? 'error' : 'success'}
                        onClick={() => onToggleStatus(sub)}
                        aria-label={sub.isActive ? `Deactivate ${sub.name}` : `Activate ${sub.name}`}
                      >
                        {sub.isActive ? (
                          <HighlightOffOutlined fontSize="small" />
                        ) : (
                          <CheckCircleOutline fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete subcategory">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete?.(sub)}
                        aria-label={`Delete ${sub.name}`}
                      >
                        <DeleteOutline fontSize="small" />
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
        count={subcategories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

SubcategoryTable.propTypes = {
  subcategories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      isActive: PropTypes.bool,
      category: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
      }),
      _count: PropTypes.shape({
        products: PropTypes.number,
      }),
    })
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};

export default SubcategoryTable;
