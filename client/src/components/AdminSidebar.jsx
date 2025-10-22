import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`block px-4 py-2 rounded-lg ${
        active
          ? 'bg-[rgb(var(--color-primary-50))] text-[rgb(var(--color-primary-700))]'
          : 'text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-hover-bg))]'
      }`}
    >
      {children}
    </Link>
  );
};

const AdminSidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <aside className="w-full lg:w-64 bg-[rgb(var(--color-bg))] rounded-lg shadow p-4 space-y-2">
      <div className="text-lg font-semibold text-[rgb(var(--color-text))] mb-2">Admin</div>
      {role === 'admin' && <NavLink to="/admin">Dashboard</NavLink>}
      <NavLink to="/admin/products">Sản phẩm</NavLink>
      <NavLink to="/admin/orders">Đơn hàng</NavLink>
      {role === 'admin' && <NavLink to="/admin/users">Người dùng</NavLink>}
    </aside>
  );
};

export default AdminSidebar;
