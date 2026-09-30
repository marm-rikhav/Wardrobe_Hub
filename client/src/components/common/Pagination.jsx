import React from 'react';
import PropTypes from 'prop-types';
import { Box, Pagination as MuiPagination, Typography } from '@mui/material';

export const Pagination = ({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 12,
  onChange,
  sx = {},
}) => {
  if (totalPages <= 1 && total <= limit) {
    return null;
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mt: 4,
        pt: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        width: '100%',
        ...sx,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Showing {total > 0 ? `${startItem}–${endItem} of ${total}` : '0'} items
      </Typography>
      <MuiPagination
        count={totalPages}
        page={page}
        onChange={(event, newPage) => onChange(newPage)}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
      />
    </Box>
  );
};

Pagination.propTypes = {
  page: PropTypes.number,
  totalPages: PropTypes.number,
  total: PropTypes.number,
  limit: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default Pagination;
