import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import productAPI from '../../api/productAPI';
import orderAPI from '../../api/orderAPI';
import userAPI from '../../api/userAPI';
import { formatVnd, parseApiResponse } from '../../utils/helpers';
import { handleError } from '../../utils/toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });

  const load = async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        orderAPI.getAllOrders(),
        productAPI.adminListProducts(),
        userAPI.getUsers(),
      ]);

      // Use parseApiResponse helper
      const orders = parseApiResponse(ordersRes);
      const products = parseApiResponse(productsRes);
      const users = parseApiResponse(usersRes);

      // Calculate revenue only from delivered orders
      const revenue = orders
        .filter((order) => order.status === 'delivered')
        .reduce((sum, order) => sum + (order.total || 0), 0);

      // Count customers (users with role 'customer')
      const customers = users.filter((user) => user.role === 'customer');

      const newStats = {
        totalOrders: orders.length,
        revenue,
        totalCustomers: customers.length,
        totalProducts: products.length,
      };

      setStats(newStats);
    } catch (error) {
      handleError(error, 'Không thể tải dữ liệu dashboard');
      // Set default values on error
      setStats({
        totalOrders: 0,
        revenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-[rgb(var(--color-bg-alt))] flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" description="Tổng quan hệ thống và thống kê">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[rgb(var(--color-primary))]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[rgb(var(--color-text-light))]">Tổng đơn hàng</p>
              <p className="text-2xl font-semibold text-[rgb(var(--color-text))]">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[rgb(var(--color-text-light))]">Doanh thu</p>
              <p className="text-2xl font-semibold text-[rgb(var(--color-text))]">{formatVnd(stats.revenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-bg))] rounded-lg shadow-sm border border-[rgb(var(--color-border))] p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-[rgb(var(--color-primary-100))] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[rgb(var(--color-primary-600))]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[rgb(var(--color-text-muted))]">Khách hàng</p>
              <p className="text-2xl font-semibold text-[rgb(var(--color-text))]">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-[rgb(var(--color-text-light))]">Sản phẩm</p>
              <p className="text-2xl font-semibold text-[rgb(var(--color-text))]">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
