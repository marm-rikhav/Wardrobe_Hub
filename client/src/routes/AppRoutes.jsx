import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StorefrontLayout from '../components/layout/StorefrontLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Pages
import Home from '../pages/Home.jsx';
import ProductListing from '../pages/products/ProductListing.jsx';
import ProductDetail from '../pages/products/ProductDetail.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import Profile from '../pages/profile/Profile.jsx';
import Addresses from '../pages/profile/Addresses.jsx';
import Cart from '../pages/cart/Cart.jsx';
import Checkout from '../pages/checkout/Checkout.jsx';
import OrderHistory from '../pages/orders/OrderHistory.jsx';
import OrderDetail from '../pages/orders/OrderDetail.jsx';
import NotFound from '../pages/NotFound.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        {/* Public Storefront Routes */}
        <Route index element={<Home />} />
        <Route path="products" element={<ProductListing />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Authenticated Protected Routes */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile/addresses"
          element={
            <ProtectedRoute>
              <Addresses />
            </ProtectedRoute>
          }
        />
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
