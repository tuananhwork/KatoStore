import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCart } from '../utils/cart';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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

          {/* Search Section - Center */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-[rgb(var(--color-primary-600))]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Navigation Section - Right */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-[rgb(var(--color-primary-600))] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
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
                    {userRole === 'admin' ||
                      (userRole === 'manager' && (
                        <div className="px-4 py-1 text-xs text-gray-500">Role: {userRole || 'N/A'}</div>
                      ))}
                    <hr className="my-2" />

                    {(userRole === 'admin' || userRole === 'manager') && (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500">Admin</div>
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
                      className="block w-full text-left px-4 py-2 text-sm text-pink-600 hover:bg-gray-100"
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
