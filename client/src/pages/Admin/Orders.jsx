import React, { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import AdminLayout from '../../components/AdminLayout';
import orderAPI from '../../api/orderAPI';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth.jsx';
import { formatVnd, getOrderStatusText, parseApiResponse } from '../../utils/helpers';
import { handleError } from '../../utils/toast';
import { Link } from 'react-router-dom';
import productAPI from '../../api/productAPI';
import { getVariantStock, getTotalStock } from '../../utils/variants';
import PrintOrder from '../../components/PrintOrder';
import { renderToFullHtml } from '../../utils/print';

const Orders = () => {
  const { handle401Error } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAllOrders();
      const data = parseApiResponse(res); // Use helper
      setOrders(data);
    } catch (error) {
      if (error?.response?.status === 401) {
        handle401Error();
        return;
      }
      handleError(error, 'Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusText = getOrderStatusText;

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateOrderStatus(orderId, status);
      await loadOrders();
      toast.success('Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
      if (error?.response?.status === 401) {
        handle401Error();
        return;
      }
      handleError(error, 'Cập nhật trạng thái thất bại');
    }
  };

  const printOrder = async (order) => {
    if (!order) return;
    // Fetch latest stock per item
    const skuToStockLeft = {};
    try {
      for (const it of order.items || []) {
        const p = await productAPI.getProductBySku(it.sku);
        if (it.color && it.size) {
          skuToStockLeft[`${it.sku}-${it.color || ''}-${it.size || ''}`] = getVariantStock(p, it.color, it.size);
        } else {
          skuToStockLeft[`${it.sku}--`] = getTotalStock(p);
        }
      }
    } catch {
      // ignore fetch errors for stock display
    }

    const html = renderToFullHtml(<PrintOrder order={order} skuToStockLeft={skuToStockLeft} />);
    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Không thể mở cửa sổ in');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    try {
      win.history.replaceState(null, '', `/print/order/${order._id}`);
    } catch {
      // ignore
    }
    win.focus();
    win.onload = () => {
      try {
        win.print();
      } catch {
        // ignore print errors
      }
    };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản lý đơn hàng" description="Quản lý và theo dõi tất cả đơn hàng">
      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách đơn hàng ({orders.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    Chưa có đơn hàng
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.shippingAddress?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.shippingAddress?.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatVnd(order.total)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <select
                          defaultValue={order.status}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        >
                          <option value="pending">{getStatusText('pending')}</option>
                          <option value="processing">{getStatusText('processing')}</option>
                          <option value="shipped">{getStatusText('shipped')}</option>
                          <option value="delivered">{getStatusText('delivered')}</option>
                          <option value="cancelled">{getStatusText('cancelled')}</option>
                          <option value="refunded">{getStatusText('refunded')}</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <Link
                          to={`/admin/order/${order._id}`}
                          className="text-[rgb(var(--color-primary))] hover:text-pink-900 hover:underline"
                        >
                          Xem
                        </Link>
                        <button
                          onClick={() => printOrder(order)}
                          className="text-[rgb(var(--color-primary))] hover:text-pink-900 hover:underline"
                        >
                          In
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Orders;
