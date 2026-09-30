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
} from '@mui/icons-material';
import productService from '../../services/productService.js';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setUploadError('Invalid format. Only JPG, PNG, and WebP images are supported.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size exceeds the 2 MB limit. Please select a smaller image.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Validate aspect ratio via client-side Image load (~4:5 = 0.80)
    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (ratio < 0.68 || ratio > 0.92) {
        setAspectRatioWarning(
          `Image ratio is ${ratio.toFixed(2)}:1. Recommended is ~4:5 (0.80:1, e.g. 1200x1500px). Upload might be rejected by backend aspect-ratio validation.`
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
            Cloudinary-backed storage. Max 2MB, JPG/PNG/WebP, 4:5 aspect ratio.
          </Typography>
        </Box>

        <Chip
          label={`${images.length} of ${MAX_IMAGES} slots`}
          size="small"
          color={images.length >= MAX_IMAGES ? 'warning' : 'default'}
          variant="outlined"
        />
      </Box>

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
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Ready to Upload: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </Typography>

              {aspectRatioWarning && (
                <Alert severity="warning" icon={<InfoOutlined />} sx={{ my: 1.5 }}>
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
                        maxHeight: 140,
                        objectFit: 'contain',
                        borderRadius: 1,
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
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading to Cloudinary...' : 'Upload Image'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CloudUploadOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Upload Product Photo
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Supports JPG, PNG, WebP up to 2MB (Recommended dimensions: 1200x1500px, 4:5 ratio)
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<CloudUploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
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
