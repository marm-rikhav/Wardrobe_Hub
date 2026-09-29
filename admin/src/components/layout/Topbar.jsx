import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LogoutOutlined,
  MenuOpenOutlined,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth.js';

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/categories': 'Categories Management',
  '/admin/subcategories': 'Subcategories Management',
  '/admin/products': 'Products Catalog',
  '/admin/products/new': 'Add New Product',
  '/admin/stock': 'Variant Stock Management',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/settings': 'Settings',
};

export const Topbar = ({ onToggleMobile, onToggleCollapse, collapsed, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/admin/products/') && location.pathname.endsWith('/edit')) {
      return 'Edit Product';
    }
    return PAGE_TITLES[location.pathname] || 'Admin Panel';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 3 } }}>
        {/* Toggle Button */}
        {isMobile ? (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={onToggleMobile}
            sx={{ mr: 1.5 }}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <IconButton
            edge="start"
            color="inherit"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapse}
            sx={{ mr: 2, display: { xs: 'none', md: 'inline-flex' } }}
          >
            {collapsed ? <MenuIcon /> : <MenuOpenOutlined />}
          </IconButton>
        )}

        {/* Page Title */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            component="div"
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: 'text.primary',
            }}
          >
            {getPageTitle()}
          </Typography>
        </Box>

        {/* User Role Badge & Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Chip
            size="small"
            label={user?.role || 'ADMIN'}
            color="secondary"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          />

          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: 'text.secondary',
              display: { xs: 'none', md: 'inline' },
            }}
          >
            {user?.name || user?.email}
          </Typography>

          <Tooltip title="Logout">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleLogout}
              startIcon={<LogoutOutlined />}
              sx={{
                minWidth: { xs: 'auto', sm: 80 },
                px: { xs: 1, sm: 1.5 },
                '& .MuiButton-startIcon': {
                  mr: { xs: 0, sm: 1 },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Logout
              </Box>
            </Button>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
