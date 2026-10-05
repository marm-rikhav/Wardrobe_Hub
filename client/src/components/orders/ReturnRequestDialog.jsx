import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';

export const PREDEFINED_REASONS = [
  'Wrong size',
  'Wrong product received',
  'Damaged product',
  'Defective product',
  'Product does not match description',
  'Changed my mind',
  'Other',
];

export const ReturnRequestDialog = ({
  open,
  orderNumber = '',
  initialType = 'RETURN',
  loading = false,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState(initialType);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setType(initialType || 'RETURN');
      setReason('');
      setDetails('');
      setErrors({});
    }
  }, [open, initialType]);

  const validate = () => {
    const newErrors = {};

    if (!type || !['RETURN', 'EXCHANGE'].includes(type)) {
      newErrors.type = 'Please select a request type.';
    }

    if (!reason || reason.trim().length === 0) {
      newErrors.reason = 'Please select a reason.';
    }

    if (reason === 'Other' && (!details || details.trim().length === 0)) {
      newErrors.details = 'Please provide details for reason "Other".';
    } else if (details && details.trim().length > 1000) {
      newErrors.details = 'Details cannot exceed 1000 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      type,
      reason: reason.trim(),
      details: details ? details.trim() : '',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="return-request-dialog-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="return-request-dialog-title" sx={{ pb: 1, fontWeight: 700 }}>
          {type === 'RETURN' ? 'Request Order Return' : 'Request Order Exchange'}
        </DialogTitle>

        <DialogContent dividers>
          {orderNumber && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Order Number: <strong>{orderNumber}</strong>
            </Typography>
          )}

          {/* Request Type Selection */}
          <FormControl component="fieldset" error={Boolean(errors.type)} sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
              Request Type
            </FormLabel>
            <RadioGroup
              row
              value={type}
              onChange={(e) => setType(e.target.value)}
              name="request-type-group"
            >
              <FormControlLabel
                value="RETURN"
                control={<Radio data-testid="return-type-radio-return" />}
                label="Return Item(s)"
                disabled={loading}
              />
              <FormControlLabel
                value="EXCHANGE"
                control={<Radio data-testid="return-type-radio-exchange" />}
                label="Exchange Item(s)"
                disabled={loading}
              />
            </RadioGroup>
            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
          </FormControl>

          {/* Reason Selection */}
          <FormControl fullWidth error={Boolean(errors.reason)} sx={{ mb: 2.5 }}>
            <InputLabel id="return-reason-label">Reason *</InputLabel>
            <Select
              labelId="return-reason-label"
              id="return-reason-select"
              value={reason}
              label="Reason *"
              data-testid="return-reason-select"
              inputProps={{ 'data-testid': 'return-reason-select-input' }}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) {
                  setErrors((prev) => ({ ...prev, reason: undefined }));
                }
              }}
              disabled={loading}
            >
              {PREDEFINED_REASONS.map((r) => (
                <MenuItem key={r} value={r} data-testid={`return-reason-${r}`}>
                  {r}
                </MenuItem>
              ))}
            </Select>
            {errors.reason && <FormHelperText>{errors.reason}</FormHelperText>}
          </FormControl>

          {/* Additional Details */}
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={reason === 'Other' ? 'Additional Details *' : 'Additional Details (Optional)'}
              placeholder={
                reason === 'Other'
                  ? 'Please describe the issue in detail...'
                  : 'Add any extra comments or exchange size/color preferences...'
              }
              value={details}
              inputProps={{ 'data-testid': 'return-details-input' }}
              onChange={(e) => {
                setDetails(e.target.value);
                if (errors.details) {
                  setErrors((prev) => ({ ...prev, details: undefined }));
                }
              }}
              error={Boolean(errors.details)}
              helperText={errors.details || `${details.length}/1000 characters`}
              disabled={loading}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={loading} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            data-testid="return-submit-btn"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ fontWeight: 600, minWidth: 120 }}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

ReturnRequestDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  orderNumber: PropTypes.string,
  initialType: PropTypes.oneOf(['RETURN', 'EXCHANGE']),
  loading: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ReturnRequestDialog;
