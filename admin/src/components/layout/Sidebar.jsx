import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  DashboardOutlined,
  CategoryOutlined,
  Inventory2Outlined,
  WarehouseOutlined,
  ShoppingBagOutlined,
  PeopleAltOutlined,
  SettingsOutlined,
  LogoutOutlined,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  ClassOutlined,
  AccountTreeOutlined,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth.js';

export const DRAWER_WIDTH = 260;
export const COLLAPSED_WIDTH = 72;

export const Sidebar = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  isMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isCatalogActive =
    location.pathname.startsWith('/admin/categories') ||
    location.pathname.startsWith('/admin/subcategories');

  const [catalogOpen, setCatalogOpen] = useState(isCatalogActive);

  // Auto-expand catalog when navigated into catalog routes
  useEffect(() => {
    if (isCatalogActive) {
      setCatalogOpen(true);
    }
  }, [isCatalogActive]);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = async () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
    await logout();
    navigate('/login');
  };

  const isCurrent = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const navItemStyles = (active) => ({
    minHeight: 44,
    borderRadius: 1.5,
    mx: collapsed && !isMobile ? 1 : 1.5,
    my: 0.5,
    px: collapsed && !isMobile ? 1.5 : 2,
    justifyContent: collapsed && !isMobile ? 'center' : 'initial',
    bgcolor: active ? 'rgba(191, 168, 138, 0.16)' : 'transparent',
    color: active ? '#BFA88A' : '#E5DED3',
    '&:hover': {
      bgcolor: active ? 'rgba(191, 168, 138, 0.24)' : 'rgba(255, 255, 255, 0.06)',
      color: '#FFFFFF',
    },
    transition: 'all 0.2s ease',
  });

  const iconStyles = (active) => ({
    minWidth: 0,
    mr: collapsed && !isMobile ? 0 : 2,
    justifyContent: 'center',
    color: active ? '#BFA88A' : '#E5DED3',
  });

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#111111',
        color: '#F5F1EB',
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          px: collapsed && !isMobile ? 1 : 2.5,
          borderBottom: '1px solid rgba(229, 222, 211, 0.12)',
        }}
      >
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: '#BFA88A',
                color: '#111111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.1rem',
                fontFamily: 'serif',
              }}
            >
              W
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#F5F1EB',
                lineHeight: 1.2,
              }}
            >
              Wardrobe Hub
            </Typography>
          </Box>
        )}

        {collapsed && !isMobile && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: '#BFA88A',
              color: '#111111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.2rem',
              fontFamily: 'serif',
            }}
          >
            W
          </Box>
        )}

        {!isMobile && (
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            sx={{
              color: '#BFA88A',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        )}
      </Box>

      {/* Navigation List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1.5 }}>
        <List disablePadding>
          {/* Dashboard */}
          <ListItem disablePadding>
            <Tooltip title={collapsed && !isMobile ? 'Dashboard' : ''} placement="right">
              <ListItemButton
                onClick={() => handleNavigate('/admin')}
                sx={navItemStyles(isCurrent('/admin'))}
              >
                <ListItemIcon sx={iconStyles(isCurrent('/admin'))}>
                  <DashboardOutlined fontSize="small" />
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary="Dashboard"
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {/* Catalog Group (Collapsible) */}
          <ListItem disablePadding sx={{ display: 'block' }}>
            <Tooltip title={collapsed && !isMobile ? 'Catalog' : ''} placement="right">
              <ListItemButton
                onClick={() => {
                  if (collapsed && !isMobile) {
                    onToggleCollapse();
                    setCatalogOpen(true);
                  } else {
                    setCatalogOpen(!catalogOpen);
                  }
                }}
                sx={navItemStyles(isCatalogActive)}
              >
                <ListItemIcon sx={iconStyles(isCatalogActive)}>
                  <CategoryOutlined fontSize="small" />
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <>
                    <ListItemText
                      primary="Catalog"
                      primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                    />
                    {catalogOpen ? (
                      <ExpandLess sx={{ fontSize: 18, color: '#BFA88A' }} />
                    ) : (
                      <ExpandMore sx={{ fontSize: 18, color: '#E5DED3' }} />
                    )}
                  </>
                )}
              </ListItemButton>
            </Tooltip>

            {/* Catalog Sub-items */}
            <Collapse in={(!collapsed || isMobile) && catalogOpen} timeout="auto" unmountOnExit>
              <List disablePadding sx={{ pl: 2.5 }}>
                {/* Categories */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigate('/admin/categories')}
                    sx={navItemStyles(isCurrent('/admin/categories'))}
                  >
                    <ListItemIcon sx={iconStyles(isCurrent('/admin/categories'))}>
                      <ClassOutlined sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Categories"
                      primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isCurrent('/admin/categories') ? 600 : 400 }}
                    />
                  </ListItemButton>
                </ListItem>

                {/* Subcategories */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigate('/admin/subcategories')}
                    sx={navItemStyles(isCurrent('/admin/subcategories'))}
                  >
                    <ListItemIcon sx={iconStyles(isCurrent('/admin/subcategories'))}>
                      <AccountTreeOutlined sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Subcategories"
                      primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isCurrent('/admin/subcategories') ? 600 : 400 }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>
          </ListItem>

          {/* Products */}
          <ListItem disablePadding>
            <Tooltip title={collapsed && !isMobile ? 'Products' : ''} placement="right">
              <ListItemButton
                onClick={() => handleNavigate('/admin/products')}
                sx={navItemStyles(isCurrent('/admin/products'))}
              >
                <ListItemIcon sx={iconStyles(isCurrent('/admin/products'))}>
                  <Inventory2Outlined fontSize="small" />
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary="Products"
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {/* Stock */}
          <ListItem disablePadding>
            <Tooltip title={collapsed && !isMobile ? 'Stock' : ''} placement="right">
              <ListItemButton
                onClick={() => handleNavigate('/admin/stock')}
                sx={navItemStyles(isCurrent('/admin/stock'))}
              >
                <ListItemIcon sx={iconStyles(isCurrent('/admin/stock'))}>
                  <WarehouseOutlined fontSize="small" />
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary="Stock"
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {/* Orders (Placeholder) */}
          <ListItem disablePadding>
            <Tooltip title={collapsed && !isMobile ? 'Orders' : ''} placement="right">
              <ListItemButton
                onClick={() => handleNavigate('/admin/orders')}
                sx={navItemStyles(isCurrent('/admin/orders'))}
              >
                <ListItemIcon sx={iconStyles(isCurrent('/admin/orders'))}>
                  <ShoppingBagOutlined fontSize="small" />
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary="Orders"
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {/* Customers (Placeholder) */}
          <ListItem disablePadding>
            <Tooltip title={collapsed && !isMobile ? 'Customers' : ''} placement="right">
              <ListItemButton
                onClick={() => handleNavigate('/admin/customers')}
                sx={navItemStyles(isCurrent('/admin/customers'))}
              >
                <ListItemIcon sx={iconStyles(isCurrent('/admin/customers'))}>
                  <PeopleAltOutlined fontSize="small" />
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary="Customers"
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {/* Settings (Placeholder) */}
          <ListItem disablePadding>
            <Tooltip title={collapsed && !isMobile ? 'Settings' : ''} placement="right">
              <ListItemButton
                onClick={() => handleNavigate('/admin/settings')}
                sx={navItemStyles(isCurrent('/admin/settings'))}
              >
                <ListItemIcon sx={iconStyles(isCurrent('/admin/settings'))}>
                  <SettingsOutlined fontSize="small" />
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary="Settings"
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </Box>

      {/* User Footer & Logout */}
      <Divider sx={{ borderColor: 'rgba(229, 222, 211, 0.12)' }} />
      <Box sx={{ p: collapsed && !isMobile ? 1 : 2 }}>
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, px: 0.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden', flex: 1 }}>
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 600, color: '#F5F1EB' }}
              >
                {user?.name || 'Administrator'}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ color: '#BFA88A', display: 'block', fontSize: '0.75rem' }}
              >
                {user?.email || 'Admin'}
              </Typography>
            </Box>
          </Box>
        )}

        <Tooltip title={collapsed && !isMobile ? 'Logout' : ''} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              ...navItemStyles(false),
              mx: 0,
              color: '#E5DED3',
              '&:hover': {
                bgcolor: 'rgba(192, 57, 43, 0.18)',
                color: '#ff6b6b',
              },
            }}
          >
            <ListItemIcon
              sx={{
                ...iconStyles(false),
                color: 'inherit',
              }}
            >
              <LogoutOutlined fontSize="small" />
            </ListItemIcon>
            {(!collapsed || isMobile) && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: 'none',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Box
      component="nav"
      sx={{
        width: { md: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH },
        flexShrink: { md: 0 },
        transition: 'width 0.25s ease',
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            borderRight: '1px solid rgba(229, 222, 211, 0.12)',
            transition: 'width 0.25s ease',
            overflowX: 'hidden',
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
