import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { getCart, clearCart } from '../utils/cart';
import orderAPI from '../api/orderAPI';
import paymentAPI from '../api/paymentAPI';
import { toast } from 'react-toastify';
import { formatVnd } from '../utils/helpers';
import { handleError } from '../utils/toast';
import authAPI from '../api/authAPI';
import { useAuth } from '../hooks/useAuth';
import { calcTotals } from '../utils/pricing';
import OrderSummary from '../components/OrderSummary';

const Checkout = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [confirmChecked, setConfirmChecked] = useState(false);

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
  const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const items = await getCart();
      setCartItems(Array.isArray(items) ? items : []);
      setCartLoaded(true);
    })();
  }, []);

  // Prefill form from user profile (only fill empty fields)
  useEffect(() => {
    let mounted = true;
    const prefill = (u) => {
      if (!u) return;
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || u.firstName || '',
        lastName: prev.lastName || u.lastName || '',
        email: prev.email || u.email || '',
        phone: prev.phone || u.phone || '',
        address: prev.address || u.address?.street || '',
        city: prev.city || u.address?.city || '',
        zipCode: prev.zipCode || u.address?.postalCode || '',
        country: prev.country || u.address?.country || 'Vietnam',
      }));
    };
    (async () => {
      if (!isLoggedIn) return;
      try {
        const u = await authAPI.getMe();
        if (!mounted) return;
        prefill(u);
      } catch {
        // ignore prefill errors
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  // Reset confirmation checkbox whenever step changes
  useEffect(() => {
    setConfirmChecked(false);
  }, [step]);

  // Guard: if cart loaded and empty, redirect to /cart
  useEffect(() => {
    if (cartLoaded && cartItems.length === 0) {
      toast.info('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      navigate('/cart', { replace: true });
    }
  }, [cartLoaded, cartItems, navigate]);

  // Remove duplicate formatVnd function
  // Use formatVnd from utils/helpers

  const itemsArray = Array.isArray(cartItems) ? cartItems : [];
  const { subtotal, shipping, tax, total } = calcTotals(itemsArray);

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
      if (!formData.email.trim() || !isEmail(formData.email)) return 'Email không hợp lệ';
      if (!formData.phone.trim() || !isPhone(formData.phone)) return 'Số điện thoại không hợp lệ';
      if (!formData.address.trim()) return 'Vui lòng nhập Địa chỉ';
      if (!formData.city.trim()) return 'Vui lòng nhập Thành phố';
      if (!formData.zipCode.trim()) return 'Vui lòng nhập Mã bưu điện';
    }
    if (n === 2) {
      if (paymentMethod === 'card') {
        if (!formData.cardNumber.trim()) return 'Vui lòng nhập số thẻ';
        if (!isMMYY(formData.expiryDate)) return 'Ngày hết hạn không hợp lệ (MM/YY)';
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
    if (itemsArray.length === 0) {
      toast.info('Giỏ hàng trống');
      navigate('/cart', { replace: true });
      return;
    }
    if (!confirmChecked) {
      toast.info('Vui lòng xác nhận thông tin đơn hàng trước khi đặt.');
      return;
    }
    const err = validateAll();
    if (err) {
      toast.error(err);
      setStep(err.includes('thẻ') || err.includes('CVV') || err.includes('hạn') ? 2 : 1);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: itemsArray.map((i) => ({
          sku: i.sku,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          color: i.color,
          size: i.size,
        })),
        shipping,
        tax,
        total,
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          postalCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod,
      };
      const created = await orderAPI.createOrder(payload);
      // VNPay redirect flow
      if (paymentMethod === 'vnpay' && created?._id) {
        const { paymentUrl } = await paymentAPI.vnpayCreate(created._id);
        if (paymentUrl) {
          // do not clear cart yet; clear after return/IPN
          window.location.href = paymentUrl;
          return;
        }
      }
      // Other methods: treat as success
      await clearCart();
      toast.success('Đặt hàng thành công');
      navigate(`/profile?tab=orders`);
    } catch (err) {
      handleError(err, 'Không thể tạo đơn hàng');
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
    <div className="min-h-screen bg-[rgb(var(--color-bg-alt))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">Thanh toán</h1>
          <p className="text-[rgb(var(--color-text-light))] mt-2">Hoàn tất đơn hàng của bạn</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= stepItem.number
                      ? 'bg-[rgb(var(--color-primary-500))] border-pink-600 text-[rgb(var(--color-text-light))]'
                      : 'bg-white border-gray-300 text-[rgb(var(--color-text-light))]'
                  }`}
                >
                  {step > stepItem.number ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{stepItem.number}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      step >= stepItem.number
                        ? 'text-[rgb(var(--color-primary))]'
                        : 'text-[rgb(var(--color-text-light))]'
                    }`}
                  >
                    {stepItem.title}
                  </p>
                  <p className="text-xs text-[rgb(var(--color-text-light))]">{stepItem.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-24 h-0.5 mx-4 ${
                      step > stepItem.number ? 'bg-[rgb(var(--color-primary-500))]' : 'bg-[rgb(var(--color-bg-alt))]'
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
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-6">Thông tin giao hàng</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">Họ *</label>
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
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">
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

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">
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

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">
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
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">
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
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">
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
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">
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
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">
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
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-6">Phương thức thanh toán</h2>

                  <div className="space-y-4 mb-6">
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
                      <label htmlFor="cod" className="ml-3 text-sm font-medium text-[rgb(var(--color-text-light))]">
                        Thanh toán khi nhận hàng (COD)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="vnpay"
                        name="paymentMethod"
                        value="vnpay"
                        checked={paymentMethod === 'vnpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-[rgb(var(--color-primary))] focus:ring-pink-500 border-gray-300"
                      />
                      <label htmlFor="vnpay" className="ml-3 text-sm font-medium text-[rgb(var(--color-text-light))]">
                        VNPAY
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="momo"
                        name="paymentMethod"
                        value="momo"
                        checked={paymentMethod === 'momo'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-[rgb(var(--color-primary))] focus:ring-pink-500 border-gray-300"
                      />
                      <label htmlFor="momo" className="ml-3 text-sm font-medium text-[rgb(var(--color-text-light))]">
                        MOMO
                      </label>
                    </div>

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
                      <label htmlFor="card" className="ml-3 text-sm font-medium text-[rgb(var(--color-text-light))]">
                        Thẻ tín dụng hoặc ghi nợ
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">
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
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">
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
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">
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
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-2">
                          Tên trên thẻ *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                          placeholder="NGUYEN VAN A"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Order Confirmation */}
              {step === 3 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text))] mb-6">Xác nhận đơn hàng</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-[rgb(var(--color-text))] mb-3">Thông tin giao hàng</h3>
                      <div className="bg-[rgb(var(--color-bg-alt))] p-4 rounded-lg">
                        <p className="text-sm text-[rgb(var(--color-text-light))]">
                          {formData.firstName} {formData.lastName}
                        </p>
                        <p className="text-sm text-[rgb(var(--color-text-light))]">{formData.email}</p>
                        <p className="text-sm text-[rgb(var(--color-text-light))]">{formData.phone}</p>
                        <p className="text-sm text-[rgb(var(--color-text-light))]">
                          {formData.address}, {formData.city}, {formData.zipCode}, {formData.country}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-[rgb(var(--color-text))] mb-3">Phương thức thanh toán</h3>
                      <div className="bg-[rgb(var(--color-bg-alt))] p-4 rounded-lg">
                        <p className="text-sm text-[rgb(var(--color-text-light))]">
                          {paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                          {paymentMethod === 'vnpay' && 'VNPAY'}
                          {paymentMethod === 'momo' && 'MOMO'}
                          {paymentMethod === 'card' && 'Thẻ tín dụng/ghi nợ'}
                        </p>
                        {paymentMethod === 'card' && (
                          <p className="text-sm text-[rgb(var(--color-text-light))]">
                            **** **** **** {formData.cardNumber.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[rgb(var(--color-primary))] focus:ring-pink-500 border-gray-300 rounded"
                        checked={confirmChecked}
                        onChange={(e) => setConfirmChecked(e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-[rgb(var(--color-text-light))]">
                        Tôi xác nhận thông tin đơn hàng là chính xác
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 border border-gray-300 text-[rgb(var(--color-text-light))] rounded-lg hover:bg-[rgb(var(--color-bg-alt))] transition-colors"
                  >
                    Quay lại
                  </button>
                )}

                <div className="ml-auto">
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 bg-[rgb(var(--color-primary-500))] text-[rgb(var(--color-text-light))] rounded-lg hover:bg-[rgb(var(--color-primary-700))] transition-colors"
                    >
                      Tiếp tục
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !confirmChecked}
                      className="px-6 py-3 bg-[rgb(var(--color-primary-500))] text-[rgb(var(--color-text-light))] rounded-lg hover:bg-[rgb(var(--color-primary-700))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <OrderSummary title="Đơn hàng" subtotal={subtotal} shipping={shipping} tax={tax} total={total}>
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {cartItems.map((item, idx) => (
                    <div
                      key={item.key || `${item.sku}-${item.color || ''}-${item.size || ''}-${idx}`}
                      className="flex items-center space-x-3"
                    >
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[rgb(var(--color-text))]">{item.name}</p>
                        <p className="text-sm text-[rgb(var(--color-text-light))]">Số lượng: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-[rgb(var(--color-text))]">
                        {formatVnd((item.price || 0) * (item.quantity || 0))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </OrderSummary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
