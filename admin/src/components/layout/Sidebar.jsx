import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  DashboardOutlined,
  CategoryOutlined,
  Inventory2Outlined,
  WarehouseOutlined,
  ShoppingBagOutlined,
  AssignmentReturnOutlined,
  PeopleAltOutlined,
  SettingsOutlined,
  LogoutOutlined,
  ExpandLess,
  ExpandMore,
  ClassOutlined,
  AccountTreeOutlined,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth.js';

export const DRAWER_WIDTH = 260;
export const COLLAPSED_WIDTH = 72;

const NAV_ITEMS = [
  { label: 'Products', path: '/admin/products', icon: Inventory2Outlined },
  { label: 'Stock', path: '/admin/stock', icon: WarehouseOutlined },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBagOutlined },
  {
    label: 'Returns / Exchanges',
    path: '/admin/returns',
    tooltip: 'Returns',
    icon: AssignmentReturnOutlined,
  },
  { label: 'Customers', path: '/admin/customers', icon: PeopleAltOutlined },
  { label: 'Settings', path: '/admin/settings', icon: SettingsOutlined },
];

const getNavItemStyles = (active, isCompact) => ({
  minHeight: 44,
  borderRadius: 1.5,
  mx: isCompact ? 1 : 1.5,
  my: 0.5,
  px: isCompact ? 1.5 : 2,
  justifyContent: isCompact ? 'center' : 'initial',
  bgcolor: active ? 'rgba(191, 168, 138, 0.16)' : 'transparent',
  color: active ? '#BFA88A' : '#E5DED3',
  '&:hover': {
    bgcolor: active ? 'rgba(191, 168, 138, 0.24)' : 'rgba(255, 255, 255, 0.06)',
    color: '#FFFFFF',
  },
  transition: 'all 0.2s ease',
});

const getIconStyles = (active, isCompact) => ({
  minWidth: 0,
  mr: isCompact ? 0 : 2,
  justifyContent: 'center',
  color: active ? '#BFA88A' : '#E5DED3',
});

const BrandHeader = ({ isCompact, onNavigate }) => (
  <Box
    sx={{
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: isCompact ? 'center' : 'flex-start',
      px: isCompact ? 1 : 2.5,
      borderBottom: '1px solid rgba(229, 222, 211, 0.12)',
    }}
  >
    {!isCompact && (
      <Box
        component="div"
        onClick={onNavigate}
        role="button"
        tabIndex={0}
        aria-label="Wardrobe Hub Admin Home"
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <Box
          component="img"
          src="/wardrobe_hub_logo_dark.svg"
          alt="Wardrobe Hub"
          sx={{
            height: 34,
            maxWidth: 165,
            width: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </Box>
    )}

    {isCompact && (
      <Box
        component="div"
        onClick={onNavigate}
        role="button"
        tabIndex={0}
        aria-label="Wardrobe Hub Admin Home"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Box
          component="img"
          src="/wardrobe_hub_logo_icon.svg"
          alt="Wardrobe Hub"
          sx={{
            height: 34,
            width: 34,
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </Box>
    )}
  </Box>
);

BrandHeader.propTypes = {
  isCompact: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func,
};

const SidebarNavItem = ({ item, isCompact, showLabels, isActive, onClick }) => {
  const IconComponent = item.icon;
  const tooltipTitle = isCompact ? (item.tooltip || item.label) : '';

  return (
    <ListItem disablePadding>
      <Tooltip title={tooltipTitle} placement="right">
        <ListItemButton
          onClick={onClick}
          data-testid={item.testId || `admin-nav-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
          sx={getNavItemStyles(isActive, isCompact)}
        >
          <ListItemIcon sx={getIconStyles(isActive, isCompact)}>
            <IconComponent fontSize="small" />
          </ListItemIcon>
          {showLabels && (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
};

SidebarNavItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    tooltip: PropTypes.string,
    icon: PropTypes.elementType.isRequired,
  }).isRequired,
  isCompact: PropTypes.bool.isRequired,
  showLabels: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const CatalogNavGroup = ({
  isCompact,
  showLabels,
  isCatalogActive,
  catalogOpen,
  onToggleCatalog,
  onNavigate,
  isCurrent,
}) => {
  const isCategoriesCurrent = isCurrent('/admin/categories');
  const isSubcategoriesCurrent = isCurrent('/admin/subcategories');

  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      <Tooltip title={isCompact ? 'Catalog' : ''} placement="right">
        <ListItemButton
          onClick={onToggleCatalog}
          data-testid="admin-nav-catalog"
          sx={getNavItemStyles(isCatalogActive, isCompact)}
        >
          <ListItemIcon sx={getIconStyles(isCatalogActive, isCompact)}>
            <CategoryOutlined fontSize="small" />
          </ListItemIcon>
          {showLabels && (
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

      <Collapse in={showLabels && catalogOpen} timeout="auto" unmountOnExit>
        <List disablePadding sx={{ pl: 2.5 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => onNavigate('/admin/categories')}
              data-testid="admin-nav-categories"
              sx={getNavItemStyles(isCategoriesCurrent, false)}
            >
              <ListItemIcon sx={getIconStyles(isCategoriesCurrent, false)}>
                <ClassOutlined sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="Categories"
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: isCategoriesCurrent ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => onNavigate('/admin/subcategories')}
              data-testid="admin-nav-subcategories"
              sx={getNavItemStyles(isSubcategoriesCurrent, false)}
            >
              <ListItemIcon sx={getIconStyles(isSubcategoriesCurrent, false)}>
                <AccountTreeOutlined sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="Subcategories"
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: isSubcategoriesCurrent ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Collapse>
    </ListItem>
  );
};

CatalogNavGroup.propTypes = {
  isCompact: PropTypes.bool.isRequired,
  showLabels: PropTypes.bool.isRequired,
  isCatalogActive: PropTypes.bool.isRequired,
  catalogOpen: PropTypes.bool.isRequired,
  onToggleCatalog: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  isCurrent: PropTypes.func.isRequired,
};

const UserFooter = ({ user, isCompact, showLabels, onLogout }) => {
  const userInitial = (user?.name || user?.email || 'A').charAt(0).toUpperCase();

  return (
    <>
      <Divider sx={{ borderColor: 'rgba(229, 222, 211, 0.12)' }} />
      <Box sx={{ p: isCompact ? 1 : 2 }}>
        {showLabels && (
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
              {userInitial}
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

        <Tooltip title={isCompact ? 'Logout' : ''} placement="right">
          <ListItemButton
            onClick={onLogout}
            data-testid="admin-logout-btn"
            sx={{
              ...getNavItemStyles(false, isCompact),
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
                ...getIconStyles(false, isCompact),
                color: 'inherit',
              }}
            >
              <LogoutOutlined fontSize="small" />
            </ListItemIcon>
            {showLabels && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </>
  );
};

UserFooter.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  isCompact: PropTypes.bool.isRequired,
  showLabels: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export const Sidebar = ({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  isMobile = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isCatalogActive =
    location.pathname.startsWith('/admin/categories') ||
    location.pathname.startsWith('/admin/subcategories');

  const [catalogOpen, setCatalogOpen] = useState(isCatalogActive);

  const isCompact = collapsed && !isMobile;
  const showLabels = !collapsed || isMobile;

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

  const handleToggleCatalog = () => {
    if (isCompact) {
      onToggleCollapse?.();
      setCatalogOpen(true);
    } else {
      setCatalogOpen((prev) => !prev);
    }
  };

  const isCurrent = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

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
      <BrandHeader
        isCompact={isCompact}
        onNavigate={() => handleNavigate('/admin')}
      />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1.5 }}>
        <List disablePadding>
          <SidebarNavItem
            item={{ label: 'Dashboard', path: '/admin', icon: DashboardOutlined }}
            isCompact={isCompact}
            showLabels={showLabels}
            isActive={isCurrent('/admin')}
            onClick={() => handleNavigate('/admin')}
          />

          <CatalogNavGroup
            isCompact={isCompact}
            showLabels={showLabels}
            isCatalogActive={isCatalogActive}
            catalogOpen={catalogOpen}
            onToggleCatalog={handleToggleCatalog}
            onNavigate={handleNavigate}
            isCurrent={isCurrent}
          />

          {NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.path}
              item={item}
              isCompact={isCompact}
              showLabels={showLabels}
              isActive={isCurrent(item.path)}
              onClick={() => handleNavigate(item.path)}
            />
          ))}
        </List>
      </Box>

      <UserFooter
        user={user}
        isCompact={isCompact}
        showLabels={showLabels}
        onLogout={handleLogout}
      />
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

Sidebar.propTypes = {
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  mobileOpen: PropTypes.bool,
  onCloseMobile: PropTypes.func,
  isMobile: PropTypes.bool,
};

export default Sidebar;
