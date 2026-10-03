import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  CloudUploadOutlined,
  DeleteOutline,
  PhotoCameraOutlined,
  InfoOutlined,
  CheckCircleOutline,
  ErrorOutline,
  AspectRatioOutlined,
} from '@mui/icons-material';
import productService from '../../services/productService.js';

const MAX_IMAGES = 5;
const MIN_FILE_SIZE = 150 * 1024; // 150 KB
const MAX_FILE_SIZE = 300 * 1024; // 300 KB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MIN_ASPECT_RATIO = 0.75;
const MAX_ASPECT_RATIO = 0.85;

export const ProductImageUpload = ({
  productId,
  images = [],
  onImagesUpdated,
  disabled = false,
}) => {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [colorTag, setColorTag] = useState('');
  const [sortOrder, setSortOrder] = useState(images.length);
  const [aspectRatioWarning, setAspectRatioWarning] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setAspectRatioWarning(null);
    setImageMeta(null);

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setUploadError('Invalid format. Only JPG, JPEG, PNG, and WebP images are supported.');
      return;
    }

    const sizeKb = Number((file.size / 1024).toFixed(1));
    const isValidSize = file.size >= MIN_FILE_SIZE && file.size <= MAX_FILE_SIZE;

    if (file.size < MIN_FILE_SIZE) {
      setUploadError(`File size is too small (${sizeKb} KB). The image size must be between 150 KB and 300 KB.`);
    } else if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size exceeds the 300 KB limit (${sizeKb} KB). The image size must be between 150 KB and 300 KB.`);
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Validate aspect ratio via client-side Image load (strictly 4:5 = 0.80)
    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const ratio = width / height;
      const isValidRatio = ratio >= MIN_ASPECT_RATIO && ratio <= MAX_ASPECT_RATIO;

      setImageMeta({
        width,
        height,
        ratio,
        isValidRatio,
        isValidSize,
        sizeKb,
      });

      if (!isValidRatio) {
        setAspectRatioWarning(
          `Invalid aspect ratio (${ratio.toFixed(2)}:1 from ${width}×${height}px). Images must have a 4:5 portrait ratio (recommended 1200×1500px or 800×1000px).`
        );
      }
    };
  };

  const handleClearSelected = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setColorTag('');
    setAspectRatioWarning(null);
    setUploadError(null);
    setImageMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !productId) return;

    if (images.length >= MAX_IMAGES) {
      setUploadError(`Maximum of ${MAX_IMAGES} images reached for this product.`);
      return;
    }

    if (selectedFile.size < MIN_FILE_SIZE || selectedFile.size > MAX_FILE_SIZE) {
      setUploadError('Image size must be between 150 KB and 300 KB.');
      return;
    }

    if (imageMeta && !imageMeta.isValidRatio) {
      setUploadError('Image must have a 4:5 portrait aspect ratio (recommended 1200×1500px or 800×1000px).');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      await productService.uploadProductImage(productId, selectedFile, {
        color: colorTag.trim() || undefined,
        sortOrder: Number(sortOrder) || images.length,
      });

      handleClearSelected();
      if (onImagesUpdated) {
        onImagesUpdated();
      }
    } catch (err) {
      setUploadError(
        err.response?.data?.message || 'Failed to upload image. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDelete = (image) => {
    setImageToDelete(image);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete || !productId) return;
    setDeleting(true);
    try {
      await productService.deleteProductImage(productId, imageToDelete.id);
      setDeleteConfirmOpen(false);
      setImageToDelete(null);
      if (onImagesUpdated) {
        onImagesUpdated();
      }
    } catch (err) {
      setUploadError(
        err.response?.data?.message || 'Failed to delete image.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const canUploadMore = images.length < MAX_IMAGES;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Product Images ({images.length}/{MAX_IMAGES})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cloudinary-backed storage • 4:5 Portrait Ratio • 150 KB – 300 KB file size • Up to {MAX_IMAGES} photos
          </Typography>
        </Box>

        <Chip
          label={`${images.length} of ${MAX_IMAGES} slots used`}
          size="small"
          color={images.length >= MAX_IMAGES ? 'warning' : 'default'}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Meaningful Image Guidelines Specifications Banner */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 2,
          bgcolor: 'rgba(191, 168, 138, 0.08)',
          border: '1px solid',
          borderColor: 'primary.light',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <InfoOutlined color="primary" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={700} color="primary.main">
            Image Guidelines & Quality Standards
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
          To maintain visual consistency across the store catalog and ensure lightning-fast shopping experiences, all uploaded product photos must satisfy these specifications:
        </Typography>

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1.25, bgcolor: 'background.paper', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                ASPECT RATIO
              </Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                4:5 (Portrait)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                e.g. 1200×1500px or 800×1000px
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1.25, bgcolor: 'background.paper', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                FILE SIZE RANGE
              </Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                150 KB – 300 KB
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Min 150 KB, Max 300 KB strictly
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 1.25, bgcolor: 'background.paper', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                FORMAT & CAPACITY
              </Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                JPG, PNG, WebP
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Max {MAX_IMAGES} images ({MAX_IMAGES - images.length} remaining)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      {/* Existing Images Gallery */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {images.map((img, index) => (
          <Grid item xs={6} sm={4} md={2.4} key={img.id || index}>
            <Paper
              variant="outlined"
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                component="img"
                src={img.imageUrl}
                alt={`Product image ${index + 1}`}
                sx={{
                  width: '100%',
                  height: 180,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                  {img.color ? (
                    <Chip size="small" label={img.color} sx={{ fontSize: '0.7rem' }} />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Slot #{img.sortOrder ?? index}
                    </Typography>
                  )}
                </Box>

                <Tooltip title="Delete Image">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleOpenDelete(img)}
                    disabled={disabled}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          </Grid>
        ))}

        {images.length === 0 && !selectedFile && (
          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.default',
                borderStyle: 'dashed',
              }}
            >
              <PhotoCameraOutlined sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No images uploaded yet. Select an image below to upload.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Upload New Image Section */}
      {canUploadMore && !disabled && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            bgcolor: 'background.default',
            borderRadius: 2,
            borderStyle: 'dashed',
            borderColor: selectedFile ? 'primary.main' : 'divider',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ALLOWED_TYPES.join(',')}
            style={{ display: 'none' }}
          />

          {selectedFile ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Selected: {selectedFile.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    icon={
                      selectedFile.size >= MIN_FILE_SIZE && selectedFile.size <= MAX_FILE_SIZE ? (
                        <CheckCircleOutline fontSize="small" />
                      ) : (
                        <ErrorOutline fontSize="small" />
                      )
                    }
                    label={`${imageMeta ? imageMeta.sizeKb : (selectedFile.size / 1024).toFixed(1)} KB (${
                      selectedFile.size >= MIN_FILE_SIZE && selectedFile.size <= MAX_FILE_SIZE
                        ? '150–300 KB Valid'
                        : 'Must be 150–300 KB'
                    })`}
                    color={
                      selectedFile.size >= MIN_FILE_SIZE && selectedFile.size <= MAX_FILE_SIZE
                        ? 'success'
                        : 'error'
                    }
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />

                  {imageMeta && (
                    <Chip
                      size="small"
                      icon={
                        imageMeta.isValidRatio ? (
                          <CheckCircleOutline fontSize="small" />
                        ) : (
                          <AspectRatioOutlined fontSize="small" />
                        )
                      }
                      label={`${imageMeta.width}×${imageMeta.height} px (${
                        imageMeta.isValidRatio ? '4:5 Match' : `${imageMeta.ratio.toFixed(2)}:1 (Not 4:5)`
                      })`}
                      color={imageMeta.isValidRatio ? 'success' : 'error'}
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  )}
                </Box>
              </Box>

              {aspectRatioWarning && (
                <Alert severity="error" icon={<InfoOutlined />} sx={{ my: 1.5, borderRadius: 1.5 }}>
                  {aspectRatioWarning}
                </Alert>
              )}

              <Grid container spacing={2} sx={{ mt: 0.5, alignItems: 'center' }}>
                {previewUrl && (
                  <Grid item xs={12} sm={3}>
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        maxHeight: 160,
                        objectFit: 'contain',
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={previewUrl ? 9 : 12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Associated Color (Optional)"
                        placeholder="e.g. Navy, Black, Red"
                        size="small"
                        fullWidth
                        value={colorTag}
                        onChange={(e) => setColorTag(e.target.value)}
                        disabled={uploading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Sort Order"
                        type="number"
                        size="small"
                        fullWidth
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        disabled={uploading}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 1.5, mt: 2, justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={handleClearSelected}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadOutlined />}
                      onClick={handleUpload}
                      disabled={
                        uploading ||
                        selectedFile.size < MIN_FILE_SIZE ||
                        selectedFile.size > MAX_FILE_SIZE ||
                        Boolean(imageMeta && !imageMeta.isValidRatio)
                      }
                    >
                      {uploading ? 'Uploading to Cloudinary...' : 'Upload Image'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3, px: 2 }}>
              <CloudUploadOutlined sx={{ fontSize: 44, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Upload Product Photo
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mb: 2, maxWidth: 520, mx: 'auto' }}>
                Select an image formatted in <strong>4:5 aspect ratio</strong> (e.g. 1200×1500 px or 800×1000 px) with file size between <strong>150 KB and 300 KB</strong> (JPG, PNG, WebP).
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<CloudUploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ px: 3, py: 1, fontWeight: 600 }}
              >
                Choose 4:5 Image (150KB – 300KB)
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle fontWeight={700}>Delete Product Image?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to remove this image from the product? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleting} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

ProductImageUpload.propTypes = {
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  images: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      url: PropTypes.string.isRequired,
      publicId: PropTypes.string,
      colorTag: PropTypes.string,
      sortOrder: PropTypes.number,
      isPrimary: PropTypes.bool,
    })
  ),
  onImagesUpdated: PropTypes.func,
  disabled: PropTypes.bool,
};

export default ProductImageUpload;
