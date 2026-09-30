import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, Divider } from '@mui/material';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#111111',
        color: '#F5F1EB',
        pt: { xs: 6, md: 8 },
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand info */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.08em',
                mb: 1.5,
                color: '#F5F1EB',
              }}
            >
              WARDROBE <Box component="span" sx={{ color: 'secondary.main' }}>HUB</Box>
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#BFA88A', maxWidth: 320, lineHeight: 1.7 }}
            >
              Crafted elegance, modern staples, and sustainable apparel designed to elevate your everyday wardrobe.
            </Typography>
          </Grid>

          {/* Shop Column */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#FFFFFF' }}>
              Shop
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <MuiLink
                component={Link}
                to="/products?category=men"
                sx={{ color: '#BFA88A', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
              >
                Men
              </MuiLink>
              <MuiLink
                component={Link}
                to="/products?category=women"
                sx={{ color: '#BFA88A', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
              >
                Women
              </MuiLink>
              <MuiLink
                component={Link}
                to="/products?category=kids"
                sx={{ color: '#BFA88A', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
              >
                Kids
              </MuiLink>
              <MuiLink
                component={Link}
                to="/products"
                sx={{ color: '#BFA88A', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
              >
                All Collections
              </MuiLink>
            </Box>
          </Grid>

          {/* Account Column */}
          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#FFFFFF' }}>
              Account
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <MuiLink
                component={Link}
                to="/profile"
                sx={{ color: '#BFA88A', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
              >
                My Profile
              </MuiLink>
              <MuiLink
                component={Link}
                to="/profile/addresses"
                sx={{ color: '#BFA88A', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
              >
                Address Book
              </MuiLink>
              <MuiLink
                component={Link}
                to="/login"
                sx={{ color: '#BFA88A', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
              >
                Sign In
              </MuiLink>
              <MuiLink
                component={Link}
                to="/register"
                sx={{ color: '#BFA88A', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } }}
              >
                Create Account
              </MuiLink>
            </Box>
          </Grid>

          {/* Support Column */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#FFFFFF' }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Typography variant="body2" sx={{ color: '#BFA88A' }}>
                Customer Care: support@wardrobehub.com
              </Typography>
              <Typography variant="body2" sx={{ color: '#BFA88A' }}>
                Standard Shipping: 3–5 Business Days
              </Typography>
              <Typography variant="body2" sx={{ color: '#BFA88A' }}>
                Hassle-Free 14-Day Returns & Exchanges
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(191, 168, 138, 0.2)', mb: 3 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ color: '#BFA88A' }}>
            © 2026 Wardrobe Hub. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: '#BFA88A' }}>
            Built by Marm Rikhav
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
