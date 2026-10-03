import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import ProfileLayout from '../../components/profile/ProfileLayout.jsx';
import ProfileForm from '../../components/profile/ProfileForm.jsx';

export const Profile = () => {
  return (
    <ProfileLayout>
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
    </ProfileLayout>
  );
};

export default Profile;
