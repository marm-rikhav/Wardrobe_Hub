import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import { formatDate } from '../../utils/formatters.js';

const getStatusColor = (status) => {
  switch (status) {
    case 'APPROVED':
      return {
        chipColor: 'success',
        icon: <CheckCircleOutlineIcon fontSize="small" />,
        label: 'Approved',
      };
    case 'REJECTED':
      return {
        chipColor: 'error',
        icon: <CancelOutlinedIcon fontSize="small" />,
        label: 'Rejected',
      };
    case 'PENDING':
    default:
      return {
        chipColor: 'warning',
        icon: <HourglassEmptyOutlinedIcon fontSize="small" />,
        label: 'Pending Review',
      };
  }
};

export const ReturnRequestStatusCard = ({ request }) => {
  if (!request) return null;

  const isReturn = request.type === 'RETURN';
  const requestType = isReturn ? 'return' : 'exchange';
  const statusInfo = getStatusColor(request.status);
  const rejectionMessage = request.adminResponse
    ? `Rejection Reason: ${request.adminResponse}`
    : `Your ${requestType} request could not be approved at this time.`;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        mb: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isReturn ? (
            <AssignmentReturnOutlinedIcon color="primary" sx={{ fontSize: 28 }} />
          ) : (
            <SwapHorizOutlinedIcon color="primary" sx={{ fontSize: 28 }} />
          )}
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {isReturn ? 'Return Request' : 'Exchange Request'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Submitted on {formatDate(request.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={statusInfo.icon}
          label={`Status: ${statusInfo.label}`}
          color={statusInfo.chipColor}
          variant="filled"
          sx={{ fontWeight: 600, fontSize: '0.85rem' }}
        />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Reason:</strong> {request.reason}
        </Typography>

        {request.details && (
          <Typography variant="body2" color="text.secondary">
            <strong>Additional Details:</strong> {request.details}
          </Typography>
        )}
      </Box>

      {/* Status Feedback Messages */}
      {request.status === 'APPROVED' && (
        <Alert severity="success" sx={{ mt: 2, borderRadius: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Request Approved
          </Typography>
          <Typography variant="body2">
            Your {isReturn ? 'return' : 'exchange'} request has been approved. Our team will contact you regarding pickup and next steps.
          </Typography>
          {request.adminResponse && (
            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
              Note: {request.adminResponse}
            </Typography>
          )}
        </Alert>
      )}

      {request.status === 'REJECTED' && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Request Rejected
          </Typography>
          <Typography variant="body2">
            {rejectionMessage}
          </Typography>
        </Alert>
      )}

      {request.status === 'PENDING' && (
        <Alert severity="info" sx={{ mt: 2, borderRadius: 1.5 }}>
          <Typography variant="body2">
            Your request is currently being reviewed by our support team. We will update the status shortly.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

ReturnRequestStatusCard.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.oneOf(['RETURN', 'EXCHANGE']).isRequired,
    status: PropTypes.oneOf(['PENDING', 'APPROVED', 'REJECTED']).isRequired,
    reason: PropTypes.string.isRequired,
    details: PropTypes.string,
    adminResponse: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  }).isRequired,
};

export default ReturnRequestStatusCard;
