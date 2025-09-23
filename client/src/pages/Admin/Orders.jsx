import React, { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import AdminLayout from '../../components/AdminLayout';
import orderAPI from '../../api/orderAPI';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth.jsx';
import { formatVnd } from '../../utils/helpers';

const Orders = () => {
  const { handle401Error } = useAuth();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAllOrders();
      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.orders)
        ? res.orders
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setOrders(data);
    } catch (err) {
      if (err?.response?.status === 401) {
        handle401Error();
        return;
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-pink-100 text-pink-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đã gửi hàng';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return 'Không xác định';
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateOrderStatus(orderId, status);
      await loadOrders();
      toast.success('Đã cập nhật trạng thái đơn hàng');
    } catch (err) {
      if (err?.response?.status === 401) {
        handle401Error();
        return;
      }
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleCloseOrderDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
    // Khôi phục scroll của body khi đóng modal
    document.body.style.overflow = 'unset';
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
                  Hành động
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
                          <option value="pending">Chờ xác nhận</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="shipped">Đã gửi hàng</option>
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Đã hủy</option>
                          <option value="refunded">Đã hoàn tiền</option>
                        </select>
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

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 print:static print:inset-auto print:bg-transparent print:h-auto print:w-auto print:overflow-visible">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto print:static print:top-auto print:mx-0 print:p-0 print:border-0 print:shadow-none print:rounded-none print:max-h-none print:overflow-visible print:w-auto print:h-auto">
            <div className="mt-3 print:mt-0">
              <div className="flex items-center justify-between mb-6 print:hidden">
                <h3 className="text-xl font-semibold text-gray-900">
                  Chi tiết đơn hàng #{selectedOrder._id.slice(-6)}
                </h3>
                <button
                  onClick={handleCloseOrderDetail}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="bg-pink-50 rounded-lg p-4 break-inside-avoid print:bg-white print:border print:border-gray-200">
                  <h4 className="text-lg font-medium text-pink-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Thông tin đơn hàng
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-pink-700">Mã đơn hàng</label>
                      <p className="text-sm text-gray-900 font-mono">#{selectedOrder._id.slice(-6)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-pink-700">Trạng thái</label>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}
                      >
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-pink-700">Ngày đặt</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-pink-700">Thanh toán</label>
                      <div className="text-sm text-gray-900 space-y-1">
                        <div>
                          <span className="text-gray-600">Tạm tính: </span>
                          <span className="font-medium">{formatVnd(selectedOrder.subtotal || 0)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Thuế: </span>
                          <span className="font-medium">{formatVnd(selectedOrder.tax || 0)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phí vận chuyển: </span>
                          <span className="font-medium">{formatVnd(selectedOrder.shipping || 0)}</span>
                        </div>
                        <div className="pt-1 border-t">
                          <span className="text-gray-600">Tổng cộng: </span>
                          <span className="text-[rgb(var(--color-primary))] font-bold">
                            {formatVnd(selectedOrder.total || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-violet-50 rounded-lg p-4 break-inside-avoid print:bg-white print:border print:border-gray-200">
                  <h4 className="text-lg font-medium text-violet-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Thông tin khách hàng
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-violet-700">Tên</label>
                      <p className="text-sm text-gray-900">{selectedOrder.shippingAddress?.fullName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-violet-700">Số điện thoại</label>
                      <p className="text-sm text-gray-900">{selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-violet-700">Địa chỉ giao hàng</label>
                      <div className="text-sm text-gray-900 space-y-1">
                        <p>
                          <strong>Địa chỉ:</strong> {selectedOrder.shippingAddress?.street || 'N/A'}
                        </p>
                        <p>
                          <strong>Thành phố:</strong> {selectedOrder.shippingAddress?.city || 'N/A'}
                        </p>
                        <p>
                          <strong>Mã bưu điện:</strong> {selectedOrder.shippingAddress?.postalCode || 'N/A'}
                        </p>
                        <p>
                          <strong>Quốc gia:</strong> {selectedOrder.shippingAddress?.country || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-rose-50 rounded-lg p-4 break-inside-avoid print:bg-white print:border print:border-gray-200">
                  <h4 className="text-lg font-medium text-rose-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    Sản phẩm đã đặt
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-rose-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-rose-700 uppercase tracking-wider">
                            Sản phẩm
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-rose-700 uppercase tracking-wider">
                            Số lượng
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-rose-700 uppercase tracking-wider">
                            Giá
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-rose-700 uppercase tracking-wider">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={index} className="hover:bg-rose-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatVnd(item.price)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {formatVnd(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Orders;
