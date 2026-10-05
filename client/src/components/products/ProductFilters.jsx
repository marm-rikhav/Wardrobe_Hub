import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Divider,
  Button,
  Chip,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { COMMON_SIZES, COMMON_COLORS } from '../../utils/constants.js';
import ProductSort from './ProductSort.jsx';

export const ProductFilters = ({
  categories = [],
  selectedCategory = '',
  selectedSubcategory = '',
  selectedSize = '',
  selectedColor = '',
  minPrice = '',
  maxPrice = '',
  selectedSort = 'newest',
  onSortChange,
  onFilterChange,
  onResetFilters,
}) => {
  const [localCategory, setLocalCategory] = useState(selectedCategory || '');
  const [localSubcategory, setLocalSubcategory] = useState(selectedSubcategory || '');
  const [localSize, setLocalSize] = useState(selectedSize || '');
  const [localColor, setLocalColor] = useState(selectedColor || '');
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [priceError, setPriceError] = useState('');

  useEffect(() => {
    setLocalCategory(selectedCategory || '');
  }, [selectedCategory]);

  useEffect(() => {
    setLocalSubcategory(selectedSubcategory || '');
  }, [selectedSubcategory]);

  useEffect(() => {
    setLocalSize(selectedSize || '');
  }, [selectedSize]);

  useEffect(() => {
    setLocalColor(selectedColor || '');
  }, [selectedColor]);

  useEffect(() => {
    setLocalMinPrice(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  const activeCategoryObj = categories.find((c) => c.slug === localCategory);
  const subcategories = activeCategoryObj?.subcategories || [];

  const handleApplyFilters = () => {
    onFilterChange({
      category: localCategory || undefined,
      subcategory: localSubcategory || undefined,
      size: localSize || undefined,
      color: localColor || undefined,
    });
  };

  const handleReset = () => {
    setLocalCategory('');
    setLocalSubcategory('');
    setLocalSize('');
    setLocalColor('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setPriceError('');
    onResetFilters();
  };

  const handleApplyPrice = (e) => {
    e.preventDefault();
    setPriceError('');

    const min = localMinPrice !== '' && localMinPrice !== undefined && localMinPrice !== null ? Number(localMinPrice) : null;
    const max = localMaxPrice !== '' && localMaxPrice !== undefined && localMaxPrice !== null ? Number(localMaxPrice) : null;

    if (min !== null && min < 0) {
      setPriceError('Min price cannot be negative');
      return;
    }

    if (max !== null && max < 0) {
      setPriceError('Max price cannot be negative');
      return;
    }

    if (min !== null && max !== null && max < min) {
      setPriceError('Max price cannot be less than Min price');
      return;
    }

    onFilterChange({
      minPrice: localMinPrice || undefined,
      maxPrice: localMaxPrice || undefined,
    });
  };

  const hasActiveFilters = Boolean(
    selectedCategory ||
      selectedSubcategory ||
      selectedSize ||
      selectedColor ||
      minPrice ||
      maxPrice ||
      localCategory ||
      localSubcategory ||
      localSize ||
      localColor
  );

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        p: 2.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600} fontSize="1.05rem">
          Filters
        </Typography>
        {hasActiveFilters && (
          <Button
            size="small"
            color="secondary"
            data-testid="filters-reset-btn"
            startIcon={<FilterAltOffIcon fontSize="small" />}
            onClick={handleReset}
            sx={{ fontSize: '0.8rem', textTransform: 'none' }}
          >
            Reset
          </Button>
        )}
      </Box>

      {/* Sort By Dropdown */}
      {onSortChange && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.8, fontWeight: 700, letterSpacing: '0.05em' }}
          >
            SORT BY
          </Typography>
          <ProductSort
            value={selectedSort}
            onChange={onSortChange}
            sx={{ width: '100%' }}
          />
        </Box>
      )}

      <Divider sx={{ mb: 1.5 }} />

      {/* Category Accordion */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 44 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Category
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pt: 0, pb: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((cat) => {
              const isSelected = localCategory === cat.slug;
              return (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  clickable
                  data-testid={`filter-category-${cat.slug}`}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => {
                    if (isSelected) {
                      setLocalCategory('');
                      setLocalSubcategory('');
                    } else {
                      setLocalCategory(cat.slug);
                      setLocalSubcategory('');
                    }
                  }}
                />
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Subcategory Accordion (Visible when a category is selected and has subcategories) */}
      {subcategories.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 44 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Subcategory
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 0, pb: 1.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {subcategories.map((sub) => {
                  const isSelected = localSubcategory === sub.slug;
                  return (
                    <Chip
                      key={sub.id}
                      label={sub.name}
                      clickable
                      data-testid={`filter-subcategory-${sub.slug}`}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      size="small"
                      onClick={() => {
                        setLocalSubcategory(isSelected ? '' : sub.slug);
                      }}
                    />
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        </>
      )}

      <Divider sx={{ my: 1 }} />

      {/* Size Filter */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 44 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Size
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pt: 0, pb: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {COMMON_SIZES.map((size) => {
              const isSelected = localSize.toUpperCase() === size.toUpperCase();
              return (
                <Chip
                  key={size}
                  label={size}
                  clickable
                  data-testid={`filter-size-${size}`}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => {
                    setLocalSize(isSelected ? '' : size);
                  }}
                  sx={{ minWidth: 38 }}
                />
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 1 }} />

      {/* Color Filter */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 44 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Color
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pt: 0, pb: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {COMMON_COLORS.map((color) => {
              const isSelected = localColor.toLowerCase() === color.toLowerCase();
              return (
                <Chip
                  key={color}
                  label={color}
                  clickable
                  data-testid={`filter-color-${color}`}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => {
                    setLocalColor(isSelected ? '' : color);
                  }}
                />
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Apply Filters Button (Above Price Range) */}
      <Box sx={{ my: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="medium"
          data-testid="filters-apply-btn"
          onClick={handleApplyFilters}
          sx={{ fontWeight: 600, py: 1 }}
        >
          Apply Filters
        </Button>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Price Range Filter */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 44 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Price Range (₹)
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pt: 0, pb: 1.5 }}>
          <Box component="form" onSubmit={handleApplyPrice}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <TextField
                size="small"
                type="number"
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => {
                  setLocalMinPrice(e.target.value);
                  if (priceError) setPriceError('');
                }}
                error={Boolean(priceError)}
                inputProps={{ min: 0, 'aria-label': 'Minimum Price', 'data-testid': 'filter-min-price-input' }}
                sx={{ backgroundColor: 'background.default' }}
              />
              <Typography variant="body2" color="text.secondary">
                –
              </Typography>
              <TextField
                size="small"
                type="number"
                placeholder="Max"
                value={localMaxPrice}
                onChange={(e) => {
                  setLocalMaxPrice(e.target.value);
                  if (priceError) setPriceError('');
                }}
                error={Boolean(priceError)}
                inputProps={{ min: 0, 'aria-label': 'Maximum Price', 'data-testid': 'filter-max-price-input' }}
                sx={{ backgroundColor: 'background.default' }}
              />
            </Box>
            {priceError && (
              <Typography
                variant="caption"
                color="error"
                sx={{ display: 'block', mb: 1.5, fontWeight: 500 }}
              >
                {priceError}
              </Typography>
            )}
            <Button
              type="submit"
              variant="outlined"
              size="small"
              fullWidth
              color="primary"
              data-testid="filter-apply-price-btn"
            >
              Apply Price
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

ProductFilters.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      slug: PropTypes.string,
      subcategories: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          name: PropTypes.string,
          slug: PropTypes.string,
        })
      ),
    })
  ),
  selectedCategory: PropTypes.string,
  selectedSubcategory: PropTypes.string,
  selectedSize: PropTypes.string,
  selectedColor: PropTypes.string,
  minPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedSort: PropTypes.string,
  onSortChange: PropTypes.func,
  onFilterChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
};

export default ProductFilters;
