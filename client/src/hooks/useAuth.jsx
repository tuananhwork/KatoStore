import { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Create Auth Context
const AuthContext = createContext();

/**
 * Custom hook for authentication state management
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync auth state from localStorage
  const syncAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userRaw = localStorage.getItem('user');
      const parsedUser = userRaw ? JSON.parse(userRaw) : null;

      const loggedIn = !!(token && parsedUser);
      setIsLoggedIn(loggedIn);
      setUser(loggedIn ? parsedUser : null);
    } catch {
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has required role
  const hasRole = (requiredRoles) => {
    if (!user?.role) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  // Check if user is admin or manager
  const isAdmin = useMemo(() => hasRole(['admin', 'manager']), [user]);

  // Handle 401 errors
  const handle401Error = (message = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.') => {
    toast.error(message);
    logout();
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/auth');
  };

  // Listen to storage changes
  useEffect(() => {
    syncAuth();

    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        syncAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    isLoggedIn,
    user,
    loading,
    hasRole,
    isAdmin,
    handle401Error,
    logout,
    syncAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook for role-based access control
 */
export const useRoleCheck = (requiredRoles, redirectOnFail = true) => {
  const { user, hasRole, handle401Error, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // đợi sync xong
    if (!user) return;

    if (!hasRole(requiredRoles)) {
      if (redirectOnFail) {
        handle401Error('Bạn không có quyền truy cập trang này.');
      }
    }
  }, [user, hasRole, requiredRoles, redirectOnFail, handle401Error, loading]);

  return {
    hasAccess: !loading && hasRole(requiredRoles),
    user,
    loading,
  };
};
