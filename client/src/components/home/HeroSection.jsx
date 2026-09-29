import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const HeroSection = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#111111',
        color: '#F5F1EB',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 8, md: 14 },
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Decorative gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background:
            'radial-gradient(circle at 80% 20%, rgba(191, 168, 138, 0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ maxWidth: 680 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'secondary.main',
              letterSpacing: '0.2em',
              fontWeight: 700,
              fontSize: { xs: '0.8rem', md: '0.9rem' },
              display: 'block',
              mb: 1.5,
            }}
          >
            NEW SEASON ESSENTIALS
          </Typography>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.2rem' },
              lineHeight: 1.1,
              mb: 2.5,
              color: '#F5F1EB',
            }}
          >
            Discover Your Style
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#BFA88A',
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.25rem' },
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            Modern, thoughtfully tailored clothing for every occasion. Experience unmatched comfort and contemporary silhouettes designed for timeless wear.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              component={Link}
              to="/products?category=men"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'secondary.main',
                color: 'primary.main',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#D1BC9F',
                },
              }}
              endIcon={<ArrowForwardIcon />}
            >
              Shop Men
            </Button>

            <Button
              component={Link}
              to="/products?category=women"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'secondary.main',
                color: 'secondary.main',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: '#FFFFFF',
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
              endIcon={<ArrowForwardIcon />}
            >
              Shop Women
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
