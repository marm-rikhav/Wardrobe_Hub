import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  VisibilityOutlined,
  CheckCircleOutline,
  CancelOutlined,
  AssignmentReturnOutlined,
  SwapHorizOutlined,
  HourglassEmptyOutlined,
} from '@mui/icons-material';
import { formatOrderDate } from '../../utils/orderConstants.js';

export const ReturnRequestTable = ({
  requests = [],
  loading = false,
  error = null,
  onViewDetail,
  onApprove,
  onReject,
}) => {
  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table aria-label="loading returns table">
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((key) => (
                <TableRow key={key}>
                  <TableCell><Skeleton width={110} height={24} /></TableCell>
                  <TableCell><Skeleton width={130} height={20} /></TableCell>
                  <TableCell><Skeleton width={80} height={24} /></TableCell>
                  <TableCell><Skeleton width={150} height={20} /></TableCell>
                  <TableCell align="center"><Skeleton width={80} height={24} sx={{ mx: 'auto' }} /></TableCell>
                  <TableCell><Skeleton width={100} height={20} /></TableCell>
                  <TableCell align="right"><Skeleton width={120} height={30} sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (requests.length === 0) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <AssignmentReturnOutlined sx={{ fontSize: 52, color: 'text.secondary', mb: 1.5 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          No return or exchange requests found.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customer requests will appear here when submitted.
        </Typography>
      </Paper>
    );
  }

  const renderStatusChip = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Chip
            size="small"
            icon={<CheckCircleOutline fontSize="small" />}
            label="Approved"
            color="success"
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'REJECTED':
        return (
          <Chip
            size="small"
            icon={<CancelOutlined fontSize="small" />}
            label="Rejected"
            color="error"
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'PENDING':
      default:
        return (
          <Chip
            size="small"
            icon={<HourglassEmptyOutlined fontSize="small" />}
            label="Pending"
            color="warning"
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <TableContainer sx={{ maxHeight: 680 }}>
        <Table stickyHeader aria-label="admin return requests table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Reason</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow
                key={req.id}
                hover
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  cursor: 'pointer',
                }}
                onClick={() => onViewDetail(req)}
              >
                {/* Order Number */}
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: 'primary.main',
                    }}
                  >
                    {req.orderNumber || 'N/A'}
                  </Typography>
                </TableCell>

                {/* Customer Name (No Customer ID displayed) */}
                <TableCell>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {req.customerName || 'Customer'}
                    </Typography>
                    {req.customerEmail && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ display: 'block' }}
                      >
                        {req.customerEmail}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Type */}
                <TableCell>
                  <Chip
                    size="small"
                    icon={
                      req.type === 'RETURN' ? (
                        <AssignmentReturnOutlined fontSize="small" />
                      ) : (
                        <SwapHorizOutlined fontSize="small" />
                      )
                    }
                    label={req.type}
                    variant="outlined"
                    color={req.type === 'RETURN' ? 'primary' : 'secondary'}
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>

                {/* Reason */}
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                    {req.reason}
                  </Typography>
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  {renderStatusChip(req.status)}
                </TableCell>

                {/* Date */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatOrderDate(req.createdAt)}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onViewDetail(req)}
                        aria-label="View request details"
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {req.status === 'PENDING' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => onApprove(req)}
                          sx={{ textTransform: 'none', fontWeight: 600, py: 0.25, px: 1.25 }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => onReject(req)}
                          sx={{ textTransform: 'none', fontWeight: 600, py: 0.25, px: 1.25 }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

ReturnRequestTable.propTypes = {
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      orderNumber: PropTypes.string,
      customerName: PropTypes.string,
      customerEmail: PropTypes.string,
      type: PropTypes.oneOf(['RETURN', 'EXCHANGE']).isRequired,
      reason: PropTypes.string.isRequired,
      details: PropTypes.string,
      status: PropTypes.oneOf(['PENDING', 'APPROVED', 'REJECTED']).isRequired,
      createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onViewDetail: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default ReturnRequestTable;
