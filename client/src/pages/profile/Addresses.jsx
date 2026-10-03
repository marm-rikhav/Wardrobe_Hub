import React from 'react';
import ProfileLayout from '../../components/profile/ProfileLayout.jsx';
import AddressList from '../../components/profile/AddressList.jsx';

export const Addresses = () => {
  return (
    <ProfileLayout>
      <AddressList />
    </ProfileLayout>
  );
};

export default Addresses;
