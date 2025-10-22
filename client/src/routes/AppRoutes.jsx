import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';

// Layout
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';

// Pages
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Auth from '../pages/Auth';
import Profile from '../pages/Profile';
import About from '../pages/About';
import Blog from '../pages/Blog';
import Contact from '../pages/Contact';
import Faq from '../pages/Faq';
import Help from '../pages/Help';
import Returns from '../pages/Returns';
import Shipping from '../pages/Shipping';
import SizeGuide from '../pages/SizeGuide';

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminProducts from '../pages/Admin/Products';
import AdminOrders from '../pages/Admin/Orders';
import AdminUsers from '../pages/Admin/Users';
import AdminProductForm from '../pages/Admin/ProductForm';
import AdminOrderDetail from '../pages/Admin/OrderDetail';
import { useRoleCheck } from '../hooks/useAuth.jsx';
import { ROLES } from '../utils/constants';
import { useAuth } from '../hooks/useAuth.jsx';

const AdminGuard = ({ roles = [ROLES.ADMIN, ROLES.MANAGER], children }) => {
  const { hasAccess, loading } = useRoleCheck(roles, false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[rgb(var(--color-text))] mb-4">404</h1>
          <p className="text-[rgb(var(--color-text-light))] mb-8">Trang không tồn tại</p>
          <Link
            to="/"
            className="bg-pink-600 text-[rgb(var(--color-text-light))] px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

const RequireAuth = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with Layout */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />

      <Route
        path="/shop"
        element={
          <Layout>
            <Shop />
          </Layout>
        }
      />

      <Route
        path="/product/:id"
        element={
          <Layout>
            <ProductDetail />
          </Layout>
        }
      />

      <Route
        path="/about"
        element={
          <Layout>
            <About />
          </Layout>
        }
      />
      <Route
        path="/blog"
        element={
          <Layout>
            <Blog />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout>
            <Contact />
          </Layout>
        }
      />
      <Route
        path="/faq"
        element={
          <Layout>
            <Faq />
          </Layout>
        }
      />
      <Route
        path="/help"
        element={
          <Layout>
            <Help />
          </Layout>
        }
      />
      <Route
        path="/returns"
        element={
          <Layout>
            <Returns />
          </Layout>
        }
      />
      <Route
        path="/shipping"
        element={
          <Layout>
            <Shipping />
          </Layout>
        }
      />
      <Route
        path="/size-guide"
        element={
          <Layout>
            <SizeGuide />
          </Layout>
        }
      />

      {/* RequireAuth Routes */}
      <Route
        path="/cart"
        element={
          <Layout>
            <RequireAuth>
              <Cart />
            </RequireAuth>
          </Layout>
        }
      />

      <Route
        path="/checkout"
        element={
          <Layout>
            <RequireAuth>
              <Checkout />
            </RequireAuth>
          </Layout>
        }
      />

      <Route
        path="/profile"
        element={
          <Layout>
            <RequireAuth>
              <Profile />
            </RequireAuth>
          </Layout>
        }
      />

      {/* Auth Routes without Header/Footer */}
      <Route
        path="/auth"
        element={
          <Layout showHeader={false} showFooter={false}>
            <Auth />
          </Layout>
        }
      />

      {/* Admin Routes (guarded) */}
      <Route
        path="/admin"
        element={
          <Layout showFooter={false}>
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          </Layout>
        }
      />

      <Route
        path="/admin/products"
        element={
          <Layout showFooter={false}>
            <AdminGuard>
              <AdminProducts />
            </AdminGuard>
          </Layout>
        }
      />

      <Route
        path="/admin/products/new"
        element={
          <Layout showFooter={false}>
            <AdminGuard>
              <AdminProductForm />
            </AdminGuard>
          </Layout>
        }
      />

      <Route
        path="/admin/products/:sku"
        element={
          <Layout showFooter={false}>
            <AdminGuard>
              <AdminProductForm />
            </AdminGuard>
          </Layout>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <Layout showFooter={false}>
            <AdminGuard>
              <AdminOrders />
            </AdminGuard>
          </Layout>
        }
      />

      <Route
        path="/admin/order/:id"
        element={
          <Layout showFooter={false}>
            <AdminGuard>
              <AdminOrderDetail />
            </AdminGuard>
          </Layout>
        }
      />

      <Route
        path="/admin/users"
        element={
          <Layout showFooter={false}>
            <AdminGuard roles={[ROLES.ADMIN]}>
              <AdminUsers />
            </AdminGuard>
          </Layout>
        }
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <Layout>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-[rgb(var(--color-text))] mb-4">404</h1>
                <p className="text-[rgb(var(--color-text-light))] mb-8">Trang không tồn tại</p>
                <Link
                  to="/"
                  className="bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-light))] px-6 py-3 rounded-lg hover:bg-[rgb(var(--color-primary-700))] transition-colors"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          </Layout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
