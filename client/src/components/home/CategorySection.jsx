import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useCategories } from '../../hooks/useCategories.js';

export const CategorySection = () => {
  const { categories } = useCategories();

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.15em' }}
            >
              COLLECTIONS
            </Typography>
            <Typography variant="h4" component="h2" fontWeight={700}>
              Shop by Category
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {categories.map((cat) => (
            <Grid item key={cat.id} xs={12} sm={4}>
              <Card
                sx={{
                  position: 'relative',
                  height: { xs: 260, md: 360 },
                  overflow: 'hidden',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    '& .cat-media': {
                      transform: 'scale(1.06)',
                    },
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  to={`/products?category=${cat.slug}`}
                  sx={{ height: '100%', width: '100%' }}
                >
                  {cat.imageUrl && (
                    <CardMedia
                      className="cat-media"
                      component="img"
                      image={cat.imageUrl}
                      alt={cat.name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                    />
                  )}
                  {/* Dark overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background:
                        'linear-gradient(to top, rgba(17,17,17,0.85) 0%, rgba(17,17,17,0.2) 60%, transparent 100%)',
                    }}
                  />
                  <CardContent
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#F5F1EB',
                    }}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={700} color="#F5F1EB">
                        {cat.name}
                      </Typography>
                      {cat.subcategories && (
                        <Typography variant="body2" sx={{ color: '#BFA88A', mt: 0.5 }}>
                          {cat.subcategories.length} Subcategories
                        </Typography>
                      )}
                    </Box>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(245,241,235,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <ArrowForwardIcon sx={{ color: '#F5F1EB' }} />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default CategorySection;
