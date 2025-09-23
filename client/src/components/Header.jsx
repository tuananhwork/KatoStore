import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCart } from '../utils/cart';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import authAPI from '../api/authAPI';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [avatar, setAvatar] = useState('/images/Avatar/avt.jpg');
  const [userRole, setUserRole] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const syncAuthFromStorage = () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userRaw ? JSON.parse(userRaw) : null;
      setIsLoggedIn(!!token && !!user);
      setUserName(user?.name || user?.email || 'User');
      setUserRole(user?.role || '');
    } catch {
      setIsLoggedIn(false);
      setUserName('');
      setUserRole('');
    }
  };

  const syncCart = () => {
    try {
      const items = getCart();
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
        setAvatar(u.avatar);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAvt();
  }, []); // Add dependency array to prevent infinite loop

  useEffect(() => {
    syncAuthFromStorage();
    syncCart();
  }, [location]);


  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      toast.success('Đã đăng xuất');
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section - Left */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="text-2xl font-bold text-[rgb(var(--color-primary))]">KatoStore</div>
            </Link>
          </div>

          {/* Navigation Section - Right */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {isLoggedIn && <NotificationBell isLoggedIn={isLoggedIn} userRole={userRole} />}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-[rgb(var(--color-primary-600))] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 2.25h1.386c.51 0 .955.343 1.087.835l.383 1.437m0 0L6.75 12.75h10.5l2.25-7.5H5.106m0 0L4.5 4.5m2.25 15a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Authentication Section */}
            {isLoggedIn ? (
              <UserMenu userName={userName} avatar={avatar} userRole={userRole} onLogout={handleLogout} />
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth?mode=login" className="px-4 py-2 text-sm font-medium link-primary">
                  Đăng nhập
                </Link>
                <Link to="/auth?mode=register" className="px-4 py-2 text-sm font-medium btn-primary">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
