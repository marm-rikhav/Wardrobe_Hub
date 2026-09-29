import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './common/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Categories from './pages/categories/Categories.jsx';
import Subcategories from './pages/subcategories/Subcategories.jsx';
import Products from './pages/products/Products.jsx';
import ProductFormPage from './pages/products/ProductFormPage.jsx';
import Stock from './pages/stock/Stock.jsx';
import Orders from './pages/Orders.jsx';
import Customers from './pages/Customers.jsx';
import Settings from './pages/Settings.jsx';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes inside AdminLayout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Index */}
            <Route index element={<Dashboard />} />

            {/* Catalog Management */}
            <Route path="categories" element={<Categories />} />
            <Route path="subcategories" element={<Subcategories />} />

            {/* Products & Variants Management */}
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />

            {/* Stock Management */}
            <Route path="stock" element={<Stock />} />

            {/* Placeholder Sections */}
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Root redirect: default to /admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
