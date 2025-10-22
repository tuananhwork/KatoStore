import React, { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import AdminLayout from '../../components/AdminLayout';
import userAPI from '../../api/userAPI';
import Pagination from '../../components/Pagination';
import { useAuth, useRoleCheck } from '../../hooks/useAuth.jsx';
import { calculatePagination, parseApiResponse } from '../../utils/helpers';
import { handleError } from '../../utils/toast';
import { ROLES } from '../../utils/constants';

const Users = () => {
  const { handle401Error } = useAuth();
  const { hasAccess } = useRoleCheck([ROLES.ADMIN]);

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getUsers();
      const parsedUsers = parseApiResponse(res); // Use helper
      setUsers(parsedUsers);
    } catch (error) {
      if (error?.response?.status === 401) {
        handle401Error();
        return;
      }
      handleError(error, 'Không thể tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (!hasAccess) {
    return (
      <AdminLayout title="Không có quyền truy cập" description="Bạn cần quyền admin để truy cập trang này.">
        <div className="min-h-screen bg-[rgb(var(--color-bg-alt))] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-4">Không có quyền truy cập</h1>
            <p className="text-[rgb(var(--color-text-light))]">Bạn cần quyền admin để truy cập trang này.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[rgb(var(--color-bg-alt))] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  // Pagination
  const total = users.length;
  const pagination = calculatePagination(total, page, pageSize);
  const pageUsers = users.slice(pagination.startIdx, pagination.endIdx);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-[rgb(var(--color-error))]/10 text-[rgb(var(--color-error))]';
      case 'manager':
        return 'bg-[rgb(var(--color-primary-100))] text-[rgb(var(--color-primary-700))]';
      case 'customer':
        return 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]';
      default:
        return 'bg-[rgb(var(--color-border))] text-[rgb(var(--color-text-muted))]';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'manager':
        return 'Quản lý';
      case 'customer':
        return 'Khách hàng';
      default:
        return 'Không xác định';
    }
  };

  return (
    <AdminLayout title="Quản lý người dùng" description="Quản lý tài khoản và quyền hạn người dùng">
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[rgb(var(--color-text))]">Danh sách người dùng ({total})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[rgb(var(--color-bg-alt))]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-light))] uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-light))] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-light))] uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-light))] uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-light))] uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-light))] uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageUsers.map((user) => (
                <tr key={user._id} className="hover:bg-[rgb(var(--color-bg-alt))]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[rgb(var(--color-bg-alt))] flex items-center justify-center">
                          <span className="text-sm font-medium text-[rgb(var(--color-text-light))]">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-[rgb(var(--color-text))]">{user.name || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text))]">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text))]">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-[rgb(var(--color-error))]'
                      }`}
                    >
                      {user.isActive !== false ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-700))]">
                        Sửa
                      </button>
                      <button className="text-[rgb(var(--color-error))] hover:text-[rgb(var(--color-primary-700))]">
                        Khóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50]}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Users;
