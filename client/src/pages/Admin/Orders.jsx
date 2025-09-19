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
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-pink-100 text-pink-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Đã giao';
      case 'processing':
        return 'Đang xử lý';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
    // Ẩn scroll của body khi modal mở
    document.body.style.overflow = 'hidden';
  };

  const handleCloseOrderDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
    // Khôi phục scroll của body khi đóng modal
    document.body.style.overflow = 'unset';
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
                  Trạng thái
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
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
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-[rgb(var(--color-primary))] hover:text-pink-900 hover:underline"
                        >
                          Xem
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
                      <label className="block text-sm font-medium text-pink-700">Tổng tiền</label>
                      <p className="text-lg text-[rgb(var(--color-primary))] font-bold">
                        {formatVnd(selectedOrder.total)}
                      </p>
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

              <div className="mt-6 flex justify-end space-x-3 print:hidden">
                <button
                  onClick={handleCloseOrderDetail}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  In đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Orders;
