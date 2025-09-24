import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';
import { getCart } from '../utils/cart';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import authAPI from '../api/authAPI';

const Header = () => {
  const { isLoggedIn, user, syncAuth } = useAuth();
  const [avatar, setAvatar] = useState('/images/Avatar/avt.jpg');
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const syncCart = async () => {
    try {
      if (!isLoggedIn) {
        setCartCount(0);
        return;
      }
      const items = await getCart();
      const count = items.reduce((s, i) => s + (i.quantity || 0), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    const fetchAvt = async () => {
      try {
        const u = await authAPI.getMe();
        if (u?.avatar) {
          setAvatar(u.avatar);
        }
      } catch (error) {
        // Ignore 401 Unauthorized error when fetching avatar
        console.debug('Failed to fetch avatar:', error);
      }
    };

    if (isLoggedIn) {
      fetchAvt();
    }
  }, [isLoggedIn]);

  // FIXED: Remove syncAuth from dependency, only sync on location change
  useEffect(() => {
    syncCart();
  }, [location, isLoggedIn]); // include auth state

  // FIXED: Separate useEffect for initial sync
  useEffect(() => {
    syncAuth();
    if (isLoggedIn) syncCart();
  }, []); // Only run once on mount

  // Update cart badge immediately on cart storage changes (same-tab dispatch)
  useEffect(() => {
    const handleStorage = (e) => {
      try {
        if (e?.key && e.key.startsWith('cart:')) {
          syncCart();
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    syncAuth();
    toast.success('Đã đăng xuất');
    navigate('/auth?mode=login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold text-[rgb(var(--color-primary))]">KatoStore</div>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* Notification */}
                <NotificationBell isLoggedIn={isLoggedIn} userRole={user?.role} />

                {/* User menu */}
                <UserMenu
                  userName={user?.name || user?.email || 'User'}
                  avatar={avatar}
                  userRole={user?.role}
                  onLogout={handleLogout}
                />
              </>
            ) : (
              <>
                <Link
                  to="/auth?mode=login"
                  className="bg-[rgb(var(--color-primary))] text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="text-[rgb(var(--color-primary))] border border-[rgb(var(--color-primary))] px-4 py-2 rounded-lg hover:bg-pink-700 hover:text-white transition-colors"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
