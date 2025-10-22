import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside';

const UserMenu = ({ userName, avatar, userRole, onLogout }) => {
  const [open, setOpen] = useState(false);
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

  // Use shared click outside hook
  const ref = useClickOutside(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[rgb(var(--color-bg-alt))] transition-colors"
      >
        {avatar ? (
          <img src={avatar} alt={userName || 'Avatar'} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center">
            <span className="text-[rgb(var(--color-text-light))] text-sm font-medium">{userInitial}</span>
          </div>
        )}
        <svg className="w-4 h-4 text-[rgb(var(--color-text))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-[rgb(var(--color-bg))] rounded-lg shadow-lg border border-[rgb(var(--color-border))] py-2 z-50">
          <div className="px-4 py-2 text-sm font-medium text-[rgb(var(--color-text))]">{userName || 'User'}</div>

          {(userRole === 'admin' || userRole === 'manager') && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-[rgb(var(--color-text-muted))]">Admin</div>
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-sm text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-bg-alt))]"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/admin/products"
                className="block px-4 py-2 text-sm text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-bg-alt))]"
                onClick={() => setOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                to="/admin/orders"
                className="block px-4 py-2 text-sm text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-bg-alt))]"
                onClick={() => setOpen(false)}
              >
                Đơn hàng
              </Link>
              {userRole === 'admin' && (
                <Link
                  to="/admin/users"
                  className="block px-4 py-2 text-sm text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-bg-alt))]"
                  onClick={() => setOpen(false)}
                >
                  Người dùng
                </Link>
              )}
              <hr className="my-2 border-[rgb(var(--color-border))]" />
            </>
          )}

          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-bg-alt))]"
            onClick={() => setOpen(false)}
          >
            Hồ sơ của tôi
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              onLogout && onLogout();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-bg-alt))]"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
