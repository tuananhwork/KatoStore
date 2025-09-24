import { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
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
  const syncAuth = useCallback(() => {
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
  }, []);

  // Check if user has required role - memoized
  const hasRole = useCallback(
    (requiredRoles) => {
      if (!user?.role) return false;
      if (Array.isArray(requiredRoles)) {
        return requiredRoles.includes(user.role);
      }
      return user.role === requiredRoles;
    },
    [user?.role]
  );

  // Check if user is admin or manager
  const isAdmin = useMemo(() => hasRole(['admin', 'manager']), [hasRole]);

  // Handle 401 errors - memoized
  const handle401Error = useCallback((message = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.') => {
    toast.error(message);
    logout();
  }, []);

  // Logout function - memoized
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  }, [navigate]);

  // Listen to storage changes - FIXED: Remove syncAuth from dependency
  useEffect(() => {
    syncAuth(); // Initial sync

    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        syncAuth(); // Sync when storage changes
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // FIXED: Empty dependency array

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      loading,
      hasRole,
      isAdmin,
      handle401Error,
      logout,
      syncAuth,
    }),
    [isLoggedIn, user, loading, hasRole, isAdmin, handle401Error, logout, syncAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook for role-based access control
 */
export const useRoleCheck = (requiredRoles, redirectOnFail = true) => {
  const { user, hasRole, handle401Error, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
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
