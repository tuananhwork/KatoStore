import React from 'react';
import { getOrderStatusText } from '../utils/helpers';

const statusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]';
    case 'processing':
      return 'bg-[rgb(var(--color-info))]/10 text-[rgb(var(--color-info))]';
    case 'shipped':
      return 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary-600))]';
    case 'delivered':
      return 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]';
    case 'cancelled':
      return 'bg-[rgb(var(--color-error))]/10 text-[rgb(var(--color-error))]';
    case 'refunded':
      return 'bg-[rgb(var(--color-text-muted))]/10 text-[rgb(var(--color-text-muted))]';
    default:
      return 'bg-[rgb(var(--color-border))] text-[rgb(var(--color-text))]';
  }
};

const OrderStatusBadge = ({ status }) => {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass(status)}`}>
      {getOrderStatusText(status)}
    </span>
  );
};

export default OrderStatusBadge;
