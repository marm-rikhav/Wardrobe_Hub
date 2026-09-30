import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import {
  LocalShippingOutlined,
  CheckCircleOutline,
  CancelOutlined,
} from '@mui/icons-material';
import {
  getPrimaryStatusAction,
  ALLOWED_STATUS_TRANSITIONS,
} from '../../utils/orderConstants.js';
import StatusConfirmDialog from './StatusConfirmDialog.jsx';

export const OrderStatusAction = ({
  currentStatus = '',
  onUpdateStatus,
  isUpdating = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const primaryAction = getPrimaryStatusAction(currentStatus);
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  const canCancel = allowedTransitions.includes('CANCELLED');

  const handleOpenConfirm = (targetStatus) => {
    setSelectedTarget(targetStatus);
    setDialogOpen(true);
  };

  const handleCloseConfirm = () => {
    if (!isUpdating) {
      setDialogOpen(false);
      setSelectedTarget(null);
    }
  };

  const handleConfirm = async () => {
    if (selectedTarget && onUpdateStatus) {
      await onUpdateStatus(selectedTarget);
      setDialogOpen(false);
      setSelectedTarget(null);
    }
  };

  const getActionIcon = (target) => {
    switch (target) {
      case 'SHIPPED':
        return <LocalShippingOutlined />;
      case 'DELIVERED':
        return <CheckCircleOutline />;
      case 'CANCELLED':
        return <CancelOutlined />;
      default:
        return null;
    }
  };

  // If order is completed or terminal (DELIVERED, CANCELLED, RETURNED) and no primary action exists
  if (!primaryAction && !canCancel) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No further status updates available for this order.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      {primaryAction && (
        <Button
          variant="contained"
          color="primary"
          size="medium"
          startIcon={getActionIcon(primaryAction.targetStatus)}
          onClick={() => handleOpenConfirm(primaryAction.targetStatus)}
          disabled={isUpdating}
          sx={{ fontWeight: 600 }}
        >
          {primaryAction.label}
        </Button>
      )}

      {canCancel && (
        <Button
          variant="outlined"
          color="error"
          size="medium"
          startIcon={<CancelOutlined />}
          onClick={() => handleOpenConfirm('CANCELLED')}
          disabled={isUpdating}
          sx={{ fontWeight: 600 }}
        >
          Cancel Order
        </Button>
      )}

      {dialogOpen && (
        <StatusConfirmDialog
          open={dialogOpen}
          currentStatus={currentStatus}
          targetStatus={selectedTarget}
          onClose={handleCloseConfirm}
          onConfirm={handleConfirm}
          loading={isUpdating}
        />
      )}
    </Box>
  );
};

OrderStatusAction.propTypes = {
  currentStatus: PropTypes.string,
  onUpdateStatus: PropTypes.func.isRequired,
  isUpdating: PropTypes.bool,
};

export default OrderStatusAction;
