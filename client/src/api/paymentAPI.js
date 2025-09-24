import apiClient from './client';

const paymentAPI = {
  vnpayCreate: async (orderId) => {
    const res = await apiClient.post('/payments/vnpay/create', { orderId });
    return res.data;
  },
};

export default paymentAPI;
