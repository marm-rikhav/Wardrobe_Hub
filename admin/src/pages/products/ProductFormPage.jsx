import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  SaveOutlined,
} from '@mui/icons-material';
import productService from '../../services/productService.js';
import categoryService from '../../services/categoryService.js';
import subcategoryService from '../../services/subcategoryService.js';
import { productSchema } from '../../common/validation/productSchemas.js';
import VariantManager from '../../components/products/VariantManager.jsx';
import ProductImageUpload from '../../components/products/ProductImageUpload.jsx';

export const ProductFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState('');
  const [productImages, setProductImages] = useState([]);

  // Snackbar Notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      brand: '',
      description: '',
      subcategoryId: '',
      basePrice: '',
      discountPrice: '',
      isActive: true,
      variants: [
        {
          sku: '',
          size: '',
          color: '',
          price: '',
          stock: 0,
          isActive: true,
        },
      ],
    },
  });

  const watchedVariants = watch('variants') || [];

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Load catalog categories and subcategories
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [cats, subs] = await Promise.all([
          categoryService.getAllCategories(),
          subcategoryService.getAllSubcategories(),
        ]);
        setCategories(cats);
        setAllSubcategories(subs);
      } catch (err) {
        showSnackbar(err.response?.data?.message || 'Failed to load category catalog', 'error');
      }
    };
    loadCatalog();
  }, []);

  // Load product if editing
  const loadProduct = async () => {
    if (!id) return;
    setInitialLoading(true);
    try {
      const prod = await productService.getProductById(id);
      if (prod) {
        setProductImages(prod.images || []);
        const parentCatId = prod.subcategory?.category?.id || prod.subcategory?.categoryId || '';
        setSelectedParentCategoryId(parentCatId);

        reset({
          name: prod.name || '',
          brand: prod.brand || '',
          description: prod.description || '',
          subcategoryId: prod.subcategoryId || '',
          basePrice: prod.basePrice === undefined ? '' : String(prod.basePrice),
          discountPrice: prod.discountPrice !== null && prod.discountPrice !== undefined ? String(prod.discountPrice) : '',
          isActive: prod.isActive ?? true,
          variants: (prod.variants || []).map((v) => ({
            id: v.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            price: v.price !== null && v.price !== undefined ? String(v.price) : '',
            stock: v.stock,
            isActive: v.isActive ?? true,
          })),
        });
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      loadProduct();
    }
  }, [id, isEditing]);

  // Filter subcategories by selected parent category
  const filteredSubcategories = selectedParentCategoryId
    ? allSubcategories.filter((s) => s.categoryId === selectedParentCategoryId)
    : allSubcategories;

  const handleParentCategoryChange = (catId) => {
    setSelectedParentCategoryId(catId);
    setValue('subcategoryId', ''); // reset subcategory selection
  };

  const handleVariantsChange = (updatedVariants) => {
    setValue('variants', updatedVariants, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setFormError(null);

    const payload = {
      name: data.name.trim(),
      brand: data.brand.trim(),
      description: data.description.trim(),
      subcategoryId: data.subcategoryId,
      basePrice: Number(data.basePrice),
      discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
      isActive: data.isActive,
      variants: data.variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        sku: v.sku.trim().toUpperCase(),
        size: v.size.trim(),
        color: v.color.trim(),
        price: v.price !== undefined && v.price !== null && v.price !== '' ? Number(v.price) : null,
        stock: Number(v.stock),
        isActive: v.isActive ?? true,
      })),
    };

    try {
      if (isEditing) {
        await productService.updateProduct(id, payload);
        showSnackbar(`Product "${payload.name}" updated successfully!`);
        await loadProduct();
      } else {
        const created = await productService.createProduct(payload);
        showSnackbar(`Product "${payload.name}" created successfully!`);
        // Redirect to edit mode so admin can upload images immediately
        navigate(`/admin/products/${created.id}/edit`, { replace: true });
      }
    } catch (err) {
      const responseData = err.response?.data;
      let detailedMsg = responseData?.message || (isEditing ? 'Failed to update product.' : 'Failed to create product.');

      if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
        const details = responseData.errors
          .map((item) => {
            let msg = item.message || '';
            if (msg.toLowerCase().includes('expected') && msg.toLowerCase().includes('received')) {
              msg = `${item.field || 'Field'} is required`;
            }
            return item.field ? `${item.field}: ${msg}` : msg;
          })
          .join(' | ');
        detailedMsg = `${detailedMsg}: ${details}`;

        responseData.errors.forEach((item) => {
          if (item.field) {
            setError(item.field, { type: 'server', message: item.message });
          }
        });
      }

      setFormError(detailedMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const onInvalid = (fieldErrors) => {
    const formatFieldLabel = (field) => {
      const fieldNames = {
        name: 'Product Name',
        brand: 'Brand',
        description: 'Description',
        subcategoryId: 'Subcategory',
        basePrice: 'Base Price',
        discountPrice: 'Discount Price',
        variants: 'Variants',
      };
      return fieldNames[field] || field;
    };

    const errorMessages = Object.entries(fieldErrors)
      .map(([field, err]) => {
        if (field === 'variants') {
          return 'Please check variant details (SKU, Size, Color, Stock)';
        }
        let msg = err?.message || '';
        if (msg.toLowerCase().includes('expected') && msg.toLowerCase().includes('received')) {
          msg = `${formatFieldLabel(field)} is required`;
        }
        return msg || `${formatFieldLabel(field)} is required`;
      })
      .filter(Boolean);

    const uniqueMessages = Array.from(new Set(errorMessages));
    setFormError(`Please fix the following: ${uniqueMessages.join(' | ')}`);
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  let subcategoryHelperText = null;
  if (errors.subcategoryId) {
    subcategoryHelperText = errors.subcategoryId.message;
  } else if (filteredSubcategories.length === 0 && selectedParentCategoryId) {
    subcategoryHelperText = 'No subcategories found in this category.';
  }

  let submitButtonLabel = 'Create Product';
  if (submitting) {
    submitButtonLabel = 'Saving...';
  } else if (isEditing) {
    submitButtonLabel = 'Save Product Changes';
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/admin/products')}
          sx={{ textDecoration: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          Products
        </Link>
        <Typography variant="body2" color="text.primary" fontWeight={600}>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </Typography>
      </Breadcrumbs>

      {/* Header and Back Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/products')}
          >
            Back
          </Button>
          <Typography variant="h5" component="h1" fontWeight={700}>
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </Typography>
        </Box>
      </Box>

      {formError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
        {/* Section 1: Basic Information */}
        <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  label="Product Name"
                  placeholder="e.g. Classic Linen Shirt"
                  fullWidth
                  required
                  disabled={submitting}
                  {...register('name')}
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Brand"
                  placeholder="e.g. Wardrobe Luxe, Cotton Mills"
                  fullWidth
                  required
                  disabled={submitting}
                  {...register('brand')}
                  error={Boolean(errors.brand)}
                  helperText={errors.brand?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          disabled={submitting}
                          color="secondary"
                        />
                      }
                      label={field.value ? 'Product Active (Visible in Store)' : 'Product Inactive (Hidden)'}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  placeholder="Provide detailed description of material, fit, and style..."
                  fullWidth
                  required
                  multiline
                  rows={3}
                  disabled={submitting}
                  {...register('description')}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 2: Catalog Categorization */}
        <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Category & Subcategory
            </Typography>
            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={2.5}>
              {/* Category Filter */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={submitting}>
                  <InputLabel id="product-parent-cat-label">Parent Category</InputLabel>
                  <Select
                    labelId="product-parent-cat-label"
                    label="Parent Category"
                    value={selectedParentCategoryId}
                    onChange={(e) => handleParentCategoryChange(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Select Category</em>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name} {cat.isActive ? '' : '(Inactive)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Subcategory Select */}
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  required
                  error={Boolean(errors.subcategoryId)}
                  disabled={submitting || filteredSubcategories.length === 0}
                >
                  <InputLabel id="product-subcat-label">Subcategory</InputLabel>
                  <Controller
                    name="subcategoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        labelId="product-subcat-label"
                        label="Subcategory"
                        {...field}
                      >
                        {filteredSubcategories.map((sub) => (
                          <MenuItem key={sub.id} value={sub.id}>
                            {sub.name} {sub.isActive ? '' : '(Inactive)'}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {subcategoryHelperText && (
                    <FormHelperText>{subcategoryHelperText}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 3: Pricing */}
        <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Pricing
            </Typography>
            <Divider sx={{ mb: 2.5 }} />

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Base Price (₹)"
                  type="number"
                  placeholder="0.00"
                  fullWidth
                  required
                  inputProps={{ min: 0.01, step: 0.01 }}
                  disabled={submitting}
                  {...register('basePrice')}
                  error={Boolean(errors.basePrice)}
                  helperText={errors.basePrice?.message}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Discount Price (₹) (Optional)"
                  type="number"
                  placeholder="Must be <= Base Price"
                  fullWidth
                  inputProps={{ min: 0.01, step: 0.01 }}
                  disabled={submitting}
                  {...register('discountPrice')}
                  error={Boolean(errors.discountPrice)}
                  helperText={errors.discountPrice?.message}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section 4: Variants & Stock */}
        <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <VariantManager
              variants={watchedVariants}
              onChange={handleVariantsChange}
              disabled={submitting}
              error={errors.variants?.message}
            />
          </CardContent>
        </Card>

        {/* Section 5: Image Management (Edit Mode) */}
        {isEditing && (
          <Card sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <ProductImageUpload
                productId={id}
                images={productImages}
                onImagesUpdated={loadProduct}
                disabled={submitting}
              />
            </CardContent>
          </Card>
        )}

        {/* Form Actions Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pb: 4 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate('/admin/products')}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SaveOutlined />}
            sx={{ px: 4 }}
          >
            {submitButtonLabel}
          </Button>
        </Box>
      </form>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductFormPage;
