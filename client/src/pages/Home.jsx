import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '../components/home/HeroSection.jsx';
import CategorySection from '../components/home/CategorySection.jsx';
import FeaturedProducts from '../components/home/FeaturedProducts.jsx';

export const Home = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
    </Box>
  );
};

export default Home;
