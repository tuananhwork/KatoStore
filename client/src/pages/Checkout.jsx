import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { getCart, clearCart } from '../utils/cart';
import orderAPI from '../api/orderAPI';
import { toast } from 'react-toastify';

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const [formData, setFormData] = useState({
    // Shipping Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Vietnam',

    // Payment Info
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',

    // Billing
    sameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingZipCode: '',
  });

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const formatVnd = (v) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(v || 0);

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 0),
    0
  );
  const shipping = subtotal > 2000000 ? 0 : 30000;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const isEmail = (v) => /.+@.+\..+/.test(v.trim());
  const isPhone = (v) => /^(\+?\d{9,15})$/.test(v.trim());
  const isMMYY = (v) => /^(0[1-9]|1[0-2])\/(\d{2})$/.test(v.trim());
  const isCVV = (v) => /^\d{3,4}$/.test(v.trim());

  const validateStep = (n) => {
    if (n === 1) {
      if (!formData.firstName.trim()) return 'Vui lòng nhập Họ';
      if (!formData.lastName.trim()) return 'Vui lòng nhập Tên';
      if (!formData.email.trim() || !isEmail(formData.email))
        return 'Email không hợp lệ';
      if (!formData.phone.trim() || !isPhone(formData.phone))
        return 'Số điện thoại không hợp lệ';
      if (!formData.address.trim()) return 'Vui lòng nhập Địa chỉ';
      if (!formData.city.trim()) return 'Vui lòng nhập Thành phố';
      if (!formData.zipCode.trim()) return 'Vui lòng nhập Mã bưu điện';
    }
    if (n === 2) {
      if (paymentMethod === 'card') {
        if (!formData.cardNumber.trim()) return 'Vui lòng nhập số thẻ';
        if (!isMMYY(formData.expiryDate))
          return 'Ngày hết hạn không hợp lệ (MM/YY)';
        if (!isCVV(formData.cvv)) return 'CVV không hợp lệ';
        if (!formData.cardName.trim()) return 'Vui lòng nhập tên trên thẻ';
      }
    }
    return '';
  };

  const validateAll = () => validateStep(1) || validateStep(2);

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.info('Giỏ hàng trống');
      return;
    }
    const err = validateAll();
    if (err) {
      toast.error(err);
      setStep(
        err.includes('thẻ') || err.includes('CVV') || err.includes('hạn')
          ? 2
          : 1
      );
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: cartItems.map((i) => ({
          sku: i.sku,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        subtotal,
        shipping,
        tax,
        total,
        paymentMethod,
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          postalCode: formData.zipCode,
          country: formData.country,
        },
      };
      await orderAPI.createOrder(payload);
      clearCart();
      toast.success('Đặt hàng thành công');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Thông tin giao hàng',
      description: 'Nhập địa chỉ giao hàng',
    },
    {
      number: 2,
      title: 'Thanh toán',
      description: 'Chọn phương thức thanh toán',
    },
    {
      number: 3,
      title: 'Xác nhận',
      description: 'Kiểm tra và xác nhận đơn hàng',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600 mt-2">Hoàn tất đơn hàng của bạn</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= stepItem.number
                      ? 'bg-pink-600 border-pink-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  {step > stepItem.number ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">
                      {stepItem.number}
                    </span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      step >= stepItem.number
                        ? 'text-[rgb(var(--color-primary))]'
                        : 'text-gray-500'
                    }`}
                  >
                    {stepItem.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stepItem.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-24 h-0.5 mx-4 ${
                      step > stepItem.number ? 'bg-pink-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Thông tin giao hàng
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Nhập họ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Nhập tên"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Nhập email"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thành phố *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Nhập thành phố"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã bưu điện *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Nhập mã bưu điện"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quốc gia *
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="Vietnam">Việt Nam</option>
                        <option value="USA">Hoa Kỳ</option>
                        <option value="UK">Anh</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Information */}
              {step === 2 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Phương thức thanh toán
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="card"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-[rgb(var(--color-primary))] focus:ring-pink-500 border-gray-300"
                      />
                      <label
                        htmlFor="card"
                        className="ml-3 text-sm font-medium text-gray-700"
                      >
                        Thẻ tín dụng/ghi nợ
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="paypal"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-[rgb(var(--color-primary))] focus:ring-pink-500 border-gray-300"
                      />
                      <label
                        htmlFor="paypal"
                        className="ml-3 text-sm font-medium text-gray-700"
                      >
                        PayPal
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-[rgb(var(--color-primary))] focus:ring-pink-500 border-gray-300"
                      />
                      <label
                        htmlFor="cod"
                        className="ml-3 text-sm font-medium text-gray-700"
                      >
                        Thanh toán khi nhận hàng (COD)
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số thẻ *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày hết hạn *
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                            placeholder="MM/YY"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                            placeholder="123"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên trên thẻ *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Nhập tên trên thẻ"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Order Confirmation */}
              {step === 3 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Xác nhận đơn hàng
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Thông tin giao hàng
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">
                          {formData.firstName} {formData.lastName}
                        </p>
                        <p className="text-sm text-gray-700">
                          {formData.email}
                        </p>
                        <p className="text-sm text-gray-700">
                          {formData.phone}
                        </p>
                        <p className="text-sm text-gray-700">
                          {formData.address}, {formData.city},{' '}
                          {formData.zipCode}, {formData.country}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Phương thức thanh toán
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">
                          {paymentMethod === 'card' && 'Thẻ tín dụng/ghi nợ'}
                          {paymentMethod === 'paypal' && 'PayPal'}
                          {paymentMethod === 'cod' &&
                            'Thanh toán khi nhận hàng (COD)'}
                        </p>
                        {paymentMethod === 'card' && (
                          <p className="text-sm text-gray-700">
                            **** **** **** {formData.cardNumber.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Quay lại
                  </button>
                )}

                <div className="ml-auto">
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      Tiếp tục
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <Spinner size="sm" className="mr-2" />
                          Đang xử lý...
                        </div>
                      ) : (
                        'Đặt hàng'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Đơn hàng</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.sku} className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatVnd((item.price || 0) * (item.quantity || 0))}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{formatVnd(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Miễn phí' : formatVnd(shipping)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thuế (10%):</span>
                    <span className="font-medium">{formatVnd(tax)}</span>
                  </div>

                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                    <span>Tổng cộng:</span>
                    <span>{formatVnd(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
