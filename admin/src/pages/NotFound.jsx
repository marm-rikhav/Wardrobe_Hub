import PropTypes from 'prop-types';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  ArrowBack as ArrowBackIcon,
  SearchOffOutlined,
} from '@mui/icons-material';

export const NotFound = ({
  title = 'Admin Page Not Found',
  message = 'The administrative page or resource you requested does not exist, has been removed, or the link may be mistyped.',
  backPath,
  backLabel = 'Go Back',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        py: { xs: 4, md: 8 },
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 560,
          width: '100%',
          p: { xs: 3, sm: 5 },
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(191, 168, 138, 0.15)',
            color: 'secondary.main',
            mb: 2.5,
          }}
        >
          <SearchOffOutlined sx={{ fontSize: 44 }} />
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: 'primary.main',
            fontSize: { xs: '4.5rem', sm: '6rem' },
            lineHeight: 1,
            mb: 1.5,
          }}
        >
          404
        </Typography>

        <Typography variant="h5" component="h2" fontWeight={700} gutterBottom>
          {title}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 440, mx: 'auto' }}>
          {message}
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ px: 3, py: 1.25, fontWeight: 600 }}
          >
            {backLabel}
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<DashboardOutlined />}
            onClick={() => navigate('/admin')}
            sx={{ px: 3.5, py: 1.25, fontWeight: 600 }}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

NotFound.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  backPath: PropTypes.string,
  backLabel: PropTypes.string,
};

export default NotFound;
