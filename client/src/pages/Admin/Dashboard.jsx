import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import productAPI from '../../api/productAPI';
import orderAPI from '../../api/orderAPI';
import userAPI from '../../api/userAPI';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const role = user?.role;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: [],
  });

  const formatVnd = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
  const normalizeSku = (s) =>
    String(s || '')
      .trim()
      .toLowerCase();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let products = [];
      let orders = [];
      let users = [];

      // products
      try {
        const productsRes = await productAPI.listProducts();
        products = Array.isArray(productsRes?.data) ? productsRes.data : Array.isArray(productsRes) ? productsRes : [];
      } catch {
        products = [];
      }

      // Build product index by normalized sku
      const productIndex = new Map();
      for (const p of products) {
        productIndex.set(normalizeSku(p.sku), p);
      }

      // orders (admin/manager)
      try {
        const ordersRes = await orderAPI.getAllOrders();
        orders = Array.isArray(ordersRes?.data)
          ? ordersRes.data
          : Array.isArray(ordersRes?.orders)
          ? ordersRes.orders
          : Array.isArray(ordersRes?.items)
          ? ordersRes.items
          : Array.isArray(ordersRes)
          ? ordersRes
          : [];
      } catch {
        orders = [];
      }

      // users (admin/manager)
      try {
        const usersRes = await userAPI.getUsers();
        users = Array.isArray(usersRes?.data)
          ? usersRes.data
          : Array.isArray(usersRes?.users)
          ? usersRes.users
          : Array.isArray(usersRes)
          ? usersRes
          : [];
      } catch {
        users = [];
      }

      const totalOrders = orders.length;
      const revenue = orders
        .filter((o) => ['delivered', 'processing'].includes(o.status))
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      const totalProducts = products.length;

      // Count customers robustly (role may be in various cases)
      const totalCustomers = users.filter((u) => String(u.role || '').toLowerCase() === 'customer').length;

      const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

      // Aggregate sold counts per normalized SKU and capture item price/name as fallback
      const skuToStats = new Map();
      for (const order of orders) {
        const items = Array.isArray(order.items) ? order.items : [];
        for (const item of items) {
          const keyRaw = item.sku || item.productSku || item.productId || item.name;
          const key = normalizeSku(keyRaw);
          if (!key) continue;
          const qty = Number(item.quantity) || 0;
          const unitPrice = Number(item.price) || 0;
          const itemName = item.name;
          const prev = skuToStats.get(key) || { sold: 0, price: 0, name: '', displaySku: keyRaw };
          const next = {
            sold: prev.sold + qty,
            // prefer last non-zero unit price seen
            price: unitPrice > 0 ? unitPrice : prev.price,
            name: prev.name || itemName || '',
            displaySku: prev.displaySku || keyRaw,
          };
          skuToStats.set(key, next);
        }
      }

      const topProducts = [...skuToStats.entries()]
        .sort((a, b) => b[1].sold - a[1].sold)
        .slice(0, 3)
        .map(([normSku, agg]) => {
          const prod = productIndex.get(normSku);
          return {
            sku: prod?.sku || agg.displaySku || normSku,
            name: prod?.name || agg.name || prod?.sku || normSku,
            sold: agg.sold,
            price: Number(prod?.price) || Number(agg.price) || 0,
          };
        });

      setStats({ totalOrders, revenue, totalCustomers, totalProducts, recentOrders, topProducts });
      setLoading(false);
    };
    if (role && ['admin', 'manager'].includes(role)) {
      load();
    }
  }, [role]);

  if (!role || !['admin', 'manager'].includes(role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-6">Trang này chỉ dành cho Admin/Manager</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <AdminSidebar />
          </div>
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
              {/* Stats Cards */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                    <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.totalOrders}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                    <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : formatVnd(stats.revenue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                    <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.totalCustomers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sản phẩm</p>
                    <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : stats.totalProducts}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Đơn hàng gần đây</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {loading && <div className="text-gray-500 text-sm">Đang tải...</div>}
                    {!loading && stats.recentOrders.length === 0 && (
                      <div className="text-gray-500 text-sm">Chưa có đơn hàng</div>
                    )}
                    {!loading &&
                      stats.recentOrders.map((o) => (
                        <div key={o._id} className="flex items-center justify_between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">#{o._id.slice(-6)}</p>
                            <p className="text-sm text-gray-500">{o.customerName || o.user?.name || 'Khách'}</p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              o.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : o.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : o.status === 'pending'
                                ? 'bg-pink-100 text-pink-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {o.status === 'delivered'
                              ? 'Đã giao'
                              : o.status === 'processing'
                              ? 'Đang xử lý'
                              : o.status === 'pending'
                              ? 'Chờ xác nhận'
                              : 'Khác'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font_medium text-gray-900">Sản phẩm bán chạy</h3>
                </div>
                <div className="p-6">
                  <div className="divide-y divide-gray-100">
                    {loading && <div className="text-gray-500 text-sm py-2">Đang tải...</div>}
                    {!loading && stats.topProducts.length === 0 && (
                      <div className="text-gray-500 text-sm py-2">Chưa có dữ liệu</div>
                    )}
                    {!loading &&
                      stats.topProducts.map((p) => (
                        <div key={p.sku} className="flex items-center justify-between py-3">
                          <div>
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">{p.name}</p>
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                Đã bán: {p.sold}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">SKU: {p.sku}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-sm font-medium">
                            {formatVnd(p.price)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
