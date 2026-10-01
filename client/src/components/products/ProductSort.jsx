import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, Select, MenuItem } from '@mui/material';
import { SORT_OPTIONS } from '../../utils/constants.js';

export const ProductSort = ({ value = 'newest', onChange, sx = {} }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 180, ...sx }}>
      <Select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{ 'aria-label': 'Sort by' }}
        sx={{ backgroundColor: 'background.paper' }}
      >
        {SORT_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

ProductSort.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default ProductSort;
