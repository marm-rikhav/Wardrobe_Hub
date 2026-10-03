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
import OrderDetail from './pages/orders/OrderDetail.jsx';
import ReturnRequests from './pages/returns/ReturnRequests.jsx';
import ReturnRequestDetailPage from './pages/returns/ReturnRequestDetailPage.jsx';
import Customers from './pages/Customers.jsx';
import CreateCustomerPage from './pages/customers/CreateCustomerPage.jsx';
import CustomerDetailPage from './pages/customers/CustomerDetailPage.jsx';
import CustomerEditPage from './pages/customers/CustomerEditPage.jsx';
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

            {/* Orders Management */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />

            {/* Returns & Exchanges Management */}
            <Route path="returns" element={<ReturnRequests />} />
            <Route path="returns/:id" element={<ReturnRequestDetailPage />} />

            {/* Customers & Settings */}
            <Route path="customers" element={<Customers />} />
            <Route path="customers/create" element={<CreateCustomerPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="customers/:id/edit" element={<CustomerEditPage />} />
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
