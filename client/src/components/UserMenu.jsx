import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const UserMenu = ({ userName, avatar, userRole, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

  useEffect(() => {
    const handleClickOutside = (event) => {
      const el = ref.current;
      if (el && !el.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {avatar ? (
          <img src={avatar} alt={userName || 'Avatar'} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">{userInitial}</span>
          </div>
        )}
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 text-sm text-gray-700 font-medium">{userName || 'User'}</div>

          {(userRole === 'admin' || userRole === 'manager') && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500">Admin</div>
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/admin/products"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                to="/admin/orders"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Đơn hàng
              </Link>
              {userRole === 'admin' && (
                <Link
                  to="/admin/users"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
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
            onClick={() => setOpen(false)}
          >
            Hồ sơ của tôi
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              onLogout && onLogout();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-[rgb(var(--color-primary))] hover:bg-gray-100"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
