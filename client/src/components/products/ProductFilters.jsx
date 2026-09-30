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

export const ProductFilters = ({
  categories = [],
  selectedCategory = '',
  selectedSubcategory = '',
  selectedSize = '',
  selectedColor = '',
  minPrice = '',
  maxPrice = '',
  onFilterChange,
  onResetFilters,
}) => {
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    setLocalMinPrice(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const subcategories = activeCategoryObj?.subcategories || [];

  const handleApplyPrice = (e) => {
    e.preventDefault();
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
      maxPrice
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
            startIcon={<FilterAltOffIcon fontSize="small" />}
            onClick={onResetFilters}
            sx={{ fontSize: '0.8rem', textTransform: 'none' }}
          >
            Reset
          </Button>
        )}
      </Box>

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
              const isSelected = selectedCategory === cat.slug;
              return (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  clickable
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() =>
                    onFilterChange({
                      category: isSelected ? undefined : cat.slug,
                      subcategory: undefined,
                    })
                  }
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
                  const isSelected = selectedSubcategory === sub.slug;
                  return (
                    <Chip
                      key={sub.id}
                      label={sub.name}
                      clickable
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      size="small"
                      onClick={() =>
                        onFilterChange({
                          subcategory: isSelected ? undefined : sub.slug,
                        })
                      }
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
              const isSelected = selectedSize.toUpperCase() === size.toUpperCase();
              return (
                <Chip
                  key={size}
                  label={size}
                  clickable
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() =>
                    onFilterChange({
                      size: isSelected ? undefined : size,
                    })
                  }
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
              const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
              return (
                <Chip
                  key={color}
                  label={color}
                  clickable
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() =>
                    onFilterChange({
                      color: isSelected ? undefined : color,
                    })
                  }
                />
              );
            })}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 1 }} />

      {/* Price Range Filter */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 44 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Price Range (₹)
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pt: 0, pb: 1.5 }}>
          <Box component="form" onSubmit={handleApplyPrice}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}>
              <TextField
                size="small"
                type="number"
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                inputProps={{ min: 0 }}
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
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                inputProps={{ min: 0 }}
                sx={{ backgroundColor: 'background.default' }}
              />
            </Box>
            <Button
              type="submit"
              variant="outlined"
              size="small"
              fullWidth
              color="primary"
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
  onFilterChange: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
};

export default ProductFilters;
