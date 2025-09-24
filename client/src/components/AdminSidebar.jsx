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
        active ? 'bg-pink-100 text-[rgb(var(--color-primary))]' : 'text-gray-700 hover:bg-gray-50'
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
    <aside className="w-full lg:w-64 bg-white rounded-lg shadow p-4 space-y-2">
      <div className="text-lg font-semibold text-gray-900 mb-2">Admin</div>
      {role === 'admin' && <NavLink to="/admin">Dashboard</NavLink>}
      <NavLink to="/admin/products">Sản phẩm</NavLink>
      <NavLink to="/admin/orders">Đơn hàng</NavLink>
      {role === 'admin' && <NavLink to="/admin/users">Người dùng</NavLink>}
    </aside>
  );
};

export default AdminSidebar;
