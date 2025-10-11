// client/src/components/OrderSummary.jsx
import React from 'react';
import { formatVnd } from '../utils/helpers';

const OrderSummary = ({ title = 'Tóm tắt đơn hàng', subtotal, shipping, tax, total, children, wrapperClassName }) => (
  <div className={wrapperClassName || 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6'}>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">Tạm tính</span>
        <span className="font-medium">{formatVnd(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Phí vận chuyển</span>
        <span className="font-medium">{shipping === 0 ? 'Miễn phí' : formatVnd(shipping)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Thuế (10%)</span>
        <span className="font-medium">{formatVnd(tax)}</span>
      </div>
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between">
          <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
          <span className="text-lg font-semibold text-gray-900">{formatVnd(total)}</span>
        </div>
      </div>
    </div>
    {children}
  </div>
);

export default OrderSummary;
