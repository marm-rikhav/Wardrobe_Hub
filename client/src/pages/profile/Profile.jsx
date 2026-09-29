import React from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Divider,
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ProfileForm from '../../components/profile/ProfileForm.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate } from '../../utils/formatters.js';

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {/* User Summary Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2.5,
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              backgroundColor: 'primary.main',
              color: 'secondary.main',
              fontWeight: 700,
              fontSize: '1.4rem',
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email} · Member since {formatDate(user?.createdAt)}
            </Typography>
          </Box>
        </Paper>

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={location.pathname}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              icon={<PersonOutlineIcon />}
              iconPosition="start"
              label="Personal Info"
              value="/profile"
            />
            <Tab
              icon={<LocationOnOutlinedIcon />}
              iconPosition="start"
              label="Saved Addresses"
              value="/profile/addresses"
            />
          </Tabs>
        </Box>

        {/* Content Area */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Personal Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update your account details and contact information.
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <ProfileForm />
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;
