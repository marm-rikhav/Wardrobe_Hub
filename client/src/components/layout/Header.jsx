import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Badge,
  InputBase,
  Divider,
  Container,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { useAuth } from '../../hooks/useAuth.js';
import { useCategories } from '../../hooks/useCategories.js';
import { useCart } from '../../hooks/useCart.js';

const SearchContainer = styled('form')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.07),
  },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  width: '100%',
  maxWidth: 320,
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.9, 1, 0.9, 0),
    paddingLeft: `calc(1em + ${theme.spacing(3)})`,
    fontSize: '0.875rem',
  },
}));

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { categories } = useCategories();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);

  const handleAccountClick = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAccountAnchorEl(null);
  };

  const handleLogout = async () => {
    handleAccountClose();
    await logout();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="default"
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 60, md: 72 } }}>
            {/* Mobile Menu Icon */}
            <IconButton
              color="inherit"
              aria-label="open navigation menu"
              edge="start"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ display: { md: 'none' }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Box
              component={Link}
              to="/"
              aria-label="Wardrobe Hub Home"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                mr: { xs: 'auto', md: 4 },
              }}
            >
              <Box
                component="img"
                src="/wardrobe_hub_logo.svg"
                alt="Wardrobe Hub"
                sx={{
                  height: { xs: 38, md: 46 },
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
            </Box>

            {/* Desktop Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
              <Button
                component={Link}
                to="/products"
                color={location.pathname === '/products' && !location.search ? 'primary' : 'inherit'}
                sx={{ fontWeight: 500 }}
              >
                All Products
              </Button>
              {categories.slice(0, 4).map((cat) => (
                <Button
                  key={cat.id}
                  component={Link}
                  to={`/products?category=${cat.slug}`}
                  color="inherit"
                  sx={{
                    fontWeight: location.search.includes(`category=${cat.slug}`) ? 700 : 500,
                    color: location.search.includes(`category=${cat.slug}`)
                      ? 'secondary.main'
                      : 'text.primary',
                  }}
                >
                  {cat.name}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop Search Bar */}
            <SearchContainer onSubmit={handleSearchSubmit}>
              <SearchIconWrapper>
                <SearchIcon fontSize="small" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search products, categories (e.g. mens jeans)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                inputProps={{ 'aria-label': 'search', 'data-testid': 'header-search-input' }}
              />
            </SearchContainer>

            {/* Mobile Search Button */}
            <IconButton
              color="inherit"
              sx={{ display: { xs: 'flex', md: 'none' } }}
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            >
              <SearchIcon />
            </IconButton>

            {/* Cart Icon */}
            <IconButton
              component={Link}
              to="/cart"
              color="inherit"
              sx={{ ml: 0.5 }}
              title="Shopping Cart"
              aria-label="shopping cart"
              data-testid="cart-button"
            >
              <Badge badgeContent={totalItems} color="secondary">
                <ShoppingBagOutlinedIcon />
              </Badge>
            </IconButton>

            {/* Account Icon / Dropdown */}
            {isAuthenticated ? (
              <Box sx={{ ml: 1 }}>
                <Button
                  onClick={handleAccountClick}
                  color="inherit"
                  data-testid="account-menu-button"
                  startIcon={<PersonOutlineOutlinedIcon />}
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    maxWidth: 160,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  <Typography variant="body2" noWrap>
                    {user?.name?.split(' ')[0] || 'Account'}
                  </Typography>
                </Button>
                <IconButton
                  color="inherit"
                  onClick={handleAccountClick}
                  data-testid="mobile-account-menu-button"
                  sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                >
                  <PersonOutlineOutlinedIcon />
                </IconButton>
                <Menu
                  anchorEl={accountAnchorEl}
                  open={Boolean(accountAnchorEl)}
                  onClose={handleAccountClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: { width: 200, mt: 1, boxShadow: 3 },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleAccountClose}
                    data-testid="profile-menu-item"
                  >
                    <AccountCircleOutlinedIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    Profile
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/orders"
                    onClick={handleAccountClose}
                    data-testid="orders-menu-item"
                  >
                    <ReceiptLongOutlinedIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    My Orders
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} data-testid="logout-menu-item" sx={{ color: 'error.main' }}>
                    <LogoutOutlinedIcon sx={{ mr: 1.5, fontSize: 20 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  color="primary"
                  data-testid="login-button"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="small"
                  color="primary"
                  data-testid="register-button"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Register
                </Button>
                <IconButton
                  component={Link}
                  to="/login"
                  color="inherit"
                  data-testid="mobile-login-button"
                  sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                >
                  <PersonOutlineOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </Toolbar>

          {/* Collapsible Mobile Search Field */}
          {mobileSearchOpen && (
            <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                pb: 1.5,
                display: { xs: 'flex', md: 'none' },
                gap: 1,
                alignItems: 'center',
              }}
            >
              <InputBase
                fullWidth
                autoFocus
                placeholder="Search products, categories (e.g. mens jeans)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{
                  px: 2,
                  py: 0.8,
                  borderRadius: 1,
                  backgroundColor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  fontSize: '0.9rem',
                }}
              />
              <IconButton type="submit" color="primary" size="small">
                <SearchIcon />
              </IconButton>
            </Box>
          )}
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{ sx: { width: 280, backgroundColor: 'background.paper' } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>
            WARDROBE <Box component="span" sx={{ color: 'secondary.main' }}>HUB</Box>
          </Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ px: 1 }}>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/"
              onClick={() => setMobileDrawerOpen(false)}
            >
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/products"
              onClick={() => setMobileDrawerOpen(false)}
            >
              <ListItemText primary="All Products" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/cart"
              onClick={() => setMobileDrawerOpen(false)}
            >
              <ListItemText
                primary={totalItems > 0 ? `Shopping Cart (${totalItems})` : 'Shopping Cart'}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block', fontWeight: 600 }}>
            CATEGORIES
          </Typography>
          {categories.map((cat) => (
            <ListItem key={cat.id} disablePadding>
              <ListItemButton
                component={Link}
                to={`/products?category=${cat.slug}`}
                onClick={() => setMobileDrawerOpen(false)}
              >
                <ListItemText primary={cat.name} />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block', fontWeight: 600 }}>
            ACCOUNT
          </Typography>
          {isAuthenticated ? (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/profile"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <ListItemText primary="My Profile" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/orders"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <ListItemText primary="My Orders" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/profile/addresses"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <ListItemText primary="Saved Addresses" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    handleLogout();
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/login"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/register"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <ListItemText primary="Create Account" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Header;
