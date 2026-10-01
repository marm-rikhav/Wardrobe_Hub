import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export const ProductSearch = ({
  value = '',
  onChange,
  placeholder = 'Search products, categories (e.g. mens jeans)...',
  sx = {},
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onChange(internalValue);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <TextField
      fullWidth
      size="small"
      value={internalValue}
      onChange={(e) => setInternalValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: internalValue ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} edge="end">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 1,
        ...sx,
      }}
    />
  );
};

ProductSearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  sx: PropTypes.object,
};

export default ProductSearch;
