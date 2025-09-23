import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCart } from '../utils/cart';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('');
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
    syncAuthFromStorage();
    syncCart();
  }, [location]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token' || e.key === 'user') syncAuthFromStorage();
      if (e.key && e.key.startsWith('cart:')) syncCart();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUserDropdownOpen(false);
      toast.success('Đã đăng xuất');
      navigate('/');
    } catch {
      navigate('/');
    }
  };

  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

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
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{userInitial}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 font-medium">{userName}</div>
                    {userRole === 'admin' && <div className="px-4 py-1 text-xs text-pink-600 font-medium">Admin</div>}

                    {userRole === 'manager' && (
                      <div className="px-4 py-1 text-xs text-blue-600 font-medium">Manager</div>
                    )}

                    <hr className="my-2" />

                    {(userRole === 'admin' || userRole === 'manager') && (
                      <>
                        {userRole === 'admin' && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            Dashboard
                          </Link>
                        )}

                        <Link
                          to="/admin/products"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          Sản phẩm
                        </Link>
                        <Link
                          to="/admin/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          Đơn hàng
                        </Link>
                        {userRole === 'admin' && (
                          <Link
                            to="/admin/users"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            Người dùng
                          </Link>
                        )}
                        <hr className="my-2" />
                      </>
                    )}

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Hồ sơ của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-[rgb(var(--color-primary))] hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
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
