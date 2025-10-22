// client/src/components/OrderSummary.jsx
import React from 'react';
import { formatVnd } from '../utils/helpers';

const OrderSummary = ({ title = 'Tóm tắt đơn hàng', subtotal, shipping, tax, total, children, wrapperClassName }) => (
  <div
    className={
      wrapperClassName ||
      'bg-[rgb(var(--color-bg))] rounded-lg shadow-sm border border-[rgb(var(--color-border))] p-6 sticky top-6'
    }
  >
    <h2 className="text-lg font-semibold text-[rgb(var(--color-text))] mb-4">{title}</h2>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-[rgb(var(--color-text-muted))]">Tạm tính</span>
        <span className="font-medium text-[rgb(var(--color-text))]">{formatVnd(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[rgb(var(--color-text-muted))]">Phí vận chuyển</span>
        <span className="font-medium text-[rgb(var(--color-text))]">
          {shipping === 0 ? 'Miễn phí' : formatVnd(shipping)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-[rgb(var(--color-text-muted))]">Thuế (10%)</span>
        <span className="font-medium text-[rgb(var(--color-text))]">{formatVnd(tax)}</span>
      </div>
      <div className="border-t border-[rgb(var(--color-border))] pt-3">
        <div className="flex justify-between">
          <span className="text-lg font-semibold text-[rgb(var(--color-text))]">Tổng cộng</span>
          <span className="text-lg font-semibold text-[rgb(var(--color-text))]">{formatVnd(total)}</span>
        </div>
      </div>
    </div>
    {children}
  </div>
);

export default OrderSummary;
