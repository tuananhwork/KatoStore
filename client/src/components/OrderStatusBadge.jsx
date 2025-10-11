import React from 'react';
import { getOrderStatusText } from '../utils/helpers';

const statusClass = (status) => {
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

const OrderStatusBadge = ({ status }) => {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass(status)}`}>
      {getOrderStatusText(status)}
    </span>
  );
};

export default OrderStatusBadge;
