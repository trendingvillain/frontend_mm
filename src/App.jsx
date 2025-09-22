import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

// Layouts
import Navbar from './components/layout/Navbar';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import Products from './pages/products/Products';
import ProductDetail from './pages/products/ProductDetail';
import Cart from './pages/cart/Cart';
import Orders from './pages/orders/Orders';
import OrderDetail from './pages/orders/OrderDetail';
import Inquiry from './pages/Inquiry/Inquiry';
import Profile from './pages/profile/profile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminPrices from './pages/admin/AdminPrices';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminGallery from './pages/admin/AdminGallery';

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isApproved } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // or spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isApproved) {
    return (
      <div style={{ padding: 20 }}>
        <Navbar />
        <h2>Refresh</h2>
        <h2>Your account is not approved yet.</h2>
        <p>Please wait for admin approval before accessing this page.</p>
      </div>
    );
  }

  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAdminAuth();
  return isAdminAuthenticated ? children : <Navigate to="/admin/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/products" />;
};

const AdminPublicRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAdminAuth();
  return !isAdminAuthenticated ? children : <Navigate to="/admin/dashboard" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AdminAuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={<AppWithAuthStatus />}
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Navbar />
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Navbar />
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <>
                    <Navbar />
                    <Products />
                  </>
                }
              />

              {/* Protected User Routes */}
              <Route
                path="/products/:id"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <ProductDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inquiry"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Inquiry />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/login"
                element={
                  <AdminPublicRoute>
                    <AdminLogin />
                  </AdminPublicRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="prices" element={<AdminPrices />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<AdminOrderDetails />} />
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="" element={<Navigate to="/admin/dashboard" />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// New component to handle the LandingPage rendering with auth status
const AppWithAuthStatus = () => {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Navbar />
      <LandingPage isAuthenticated={isAuthenticated} />
    </>
  );
};

export default App;