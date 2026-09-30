import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

export const EmptyState = ({
  icon: Icon = Inventory2OutlinedIcon,
  title = 'No items found',
  description = 'There are no items matching your criteria at this moment.',
  actionLabel,
  onAction,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: '1px dashed',
        borderColor: 'divider',
        width: '100%',
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          color: 'secondary.main',
          mb: 2,
        }}
      >
        <Icon sx={{ fontSize: 36 }} />
      </Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 440, mb: actionLabel ? 3 : 0 }}
      >
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
          sx={{ mt: 2 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.node,
  description: PropTypes.node,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  sx: PropTypes.object,
};

export default EmptyState;
