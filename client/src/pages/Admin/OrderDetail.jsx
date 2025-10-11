import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Spinner from '../../components/Spinner';
import orderAPI from '../../api/orderAPI';
import { formatVnd } from '../../utils/helpers';
import { handleError } from '../../utils/toast';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import OrderSummary from '../../components/OrderSummary';

const OrderDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await orderAPI.getOrderById(id);
        if (mounted) setOrder(data);
      } catch (err) {
        handleError(err, 'Không thể tải thông tin đơn hàng');
        if (mounted) setOrder(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
            <Link to="/admin/orders" className="text-[rgb(var(--color-primary))] hover:underline">
              Quay lại danh sách đơn hàng
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const shipping = order.shippingAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <AdminLayout title={`Đơn hàng #${String(order._id).slice(-6)}`} description="Chi tiết đơn hàng">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin đơn hàng</h2>
            <Link to="/admin/orders" className="text-sm text-[rgb(var(--color-primary))] hover:underline">
              ← Quay lại danh sách
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Mã đơn hàng</div>
              <div className="font-medium">#{String(order._id).slice(-6)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Ngày đặt</div>
              <div className="font-medium">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Trạng thái</div>
              <OrderStatusBadge status={order.status} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Phương thức thanh toán</div>
              <div className="font-medium uppercase">{order.paymentMethod}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Khách hàng & Giao hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Khách hàng</div>
              <div className="font-medium">{shipping.fullName || 'N/A'}</div>
              <div className="text-gray-700">{shipping.phone || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Địa chỉ giao hàng</div>
              <div className="text-gray-700">{shipping.street || ''}</div>
              <div className="text-gray-700">{shipping.city || ''}</div>
              <div className="text-gray-700">{shipping.postalCode || ''}</div>
              <div className="text-gray-700">{shipping.country || ''}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Màu
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SL
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((it, idx) => (
                  <tr key={`${it.sku}-${idx}`}>
                    <td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <div className="flex items-center space-x-3">
                        {it.image ? (
                          <img src={it.image} alt={it.name} className="w-10 h-10 object-cover rounded" />
                        ) : null}
                        <div>
                          <div className="font-medium">{it.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{it.sku}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{it.color || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{it.size || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 text-center">{it.quantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 text-right">{formatVnd(it.price)}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 text-right">
                      {formatVnd((it.price || 0) * (it.quantity || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <OrderSummary
          title="Tổng kết"
          subtotal={order.subtotal || 0}
          shipping={order.shipping || 0}
          tax={order.tax || 0}
          total={order.total || 0}
          wrapperClassName="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        />
      </div>
    </AdminLayout>
  );
};

export default OrderDetail;
