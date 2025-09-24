import React, { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import AdminLayout from '../../components/AdminLayout';
import orderAPI from '../../api/orderAPI';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth.jsx';
import { formatVnd, getOrderStatusText, parseApiResponse } from '../../utils/helpers';
import { handleError } from '../../utils/toast';

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

  const buildInvoiceHtml = (order) => {
    const rows = (order.items || [])
      .map(
        (it, idx) => `
          <tr>
            <td style="padding:8px;border:1px solid #e5e7eb">${idx + 1}</td>
            <td style="padding:8px;border:1px solid #e5e7eb">${it.name || ''}</td>
            <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${it.quantity || 0}</td>
            <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">${formatVnd(it.price || 0)}</td>
            <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">${formatVnd(
              (it.price || 0) * (it.quantity || 0)
            )}</td>
          </tr>`
      )
      .join('');

    const shipping = order.shippingAddress || {};

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Đơn hàng #${String(order._id || '').slice(-6)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"; margin: 0; padding: 24px; color: #111827; }
    .container { max-width: 800px; margin: 0 auto; }
    .section { margin-bottom: 16px; }
    h1 { font-size: 20px; margin: 0 0 8px; }
    h2 { font-size: 16px; margin: 0 0 8px; color: #374151; }
    table { width: 100%; border-collapse: collapse; }
    .muted { color: #6b7280; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
      .pagebreak { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="section">
      <h1>Chi tiết đơn hàng #${String(order._id || '').slice(-6)}</h1>
      <div class="muted">Ngày đặt: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
    </div>

    <div class="section grid pagebreak">
      <div>
        <h2>Khách hàng</h2>
        <div>${shipping.fullName || 'N/A'}</div>
        <div>${shipping.phone || 'N/A'}</div>
      </div>
      <div>
        <h2>Giao hàng</h2>
        <div>${shipping.street || ''}</div>
        <div>${shipping.city || ''}</div>
        <div>${shipping.postalCode || ''}</div>
        <div>${shipping.country || ''}</div>
      </div>
    </div>

    <div class="section pagebreak">
      <h2>Sản phẩm</h2>
      <table>
        <thead>
          <tr>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">#</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left">Sản phẩm</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:center">SL</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:right">Giá</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <div class="section" style="text-align:right">
      <div class="muted">Tạm tính: <strong>${formatVnd(order.subtotal || 0)}</strong></div>
      <div class="muted">Thuế: <strong>${formatVnd(order.tax || 0)}</strong></div>
      <div class="muted">Phí vận chuyển: <strong>${formatVnd(order.shipping || 0)}</strong></div>
      <h2>Tổng cộng: ${formatVnd(order.total || 0)}</h2>
    </div>

    <div class="no-print" style="margin-top:16px;text-align:right">
      <button onclick="window.print()" style="padding:8px 12px;background:#ec4899;color:white;border:none;border-radius:8px;cursor:pointer">In</button>
    </div>
  </div>
</body>
</html>`;
  };

  const printOrder = (order) => {
    if (!order) return;
    const html = buildInvoiceHtml(order);
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
                      <button
                        onClick={() => printOrder(order)}
                        className="text-[rgb(var(--color-primary))] hover:text-pink-900 hover:underline"
                      >
                        In
                      </button>
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
