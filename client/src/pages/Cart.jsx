import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { getCart, updateCartItem, removeCartItem } from '../utils/cart';
import { formatVnd } from '../utils/helpers';
import { CART } from '../utils/constants';

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  const loadCart = () => {
    setCartItems(getCart());
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
    const onStorage = (e) => {
      if (e.key && e.key.startsWith('cart:')) loadCart();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const updateQuantity = (key, newQuantity, stock) => {
    if (newQuantity < 1) return;
    const clamped = Math.min(newQuantity, stock || 9999);
    const items = updateCartItem(key, clamped);
    setCartItems(items);
  };

  const removeItem = (key) => {
    const items = removeCartItem(key);
    setCartItems(items);
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 0),
    0
  );
  const shipping =
    subtotal > CART.FREE_SHIPPING_THRESHOLD ? 0 : CART.DEFAULT_SHIPPING;
  const tax = Math.round(subtotal * CART.TAX_RATE);
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Giỏ hàng trống
            </h1>
            <p className="text-gray-600 mb-8">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Link
              to="/shop"
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Giỏ hàng</h1>
          <p className="text-gray-600">
            Kiểm tra và chỉnh sửa sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Sản phẩm ({cartItems.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.key} className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || '/api/placeholder/100/100'}
                          alt={item.name}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        {item.color && (
                          <p className="text-sm text-gray-500">
                            Màu: {item.color}
                          </p>
                        )}
                        {item.size && (
                          <p className="text-sm text-gray-500">
                            Size: {item.size}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatVnd(item.price)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Còn {item.stock} sản phẩm
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.key,
                                item.quantity - 1,
                                item.stock
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <span className="w-12 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.key,
                                item.quantity + 1,
                                item.stock
                              )
                            }
                            disabled={item.quantity >= (item.stock || 9999)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{formatVnd(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Miễn phí' : formatVnd(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế (10%)</span>
                  <span className="font-medium">{formatVnd(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Tổng cộng
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatVnd(total)}
                    </span>
                  </div>
                </div>
              </div>

              {subtotal < CART.FREE_SHIPPING_THRESHOLD && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Mua thêm{' '}
                    {formatVnd(CART.FREE_SHIPPING_THRESHOLD - subtotal)} để được
                    miễn phí vận chuyển!
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <Link
                  to="/checkout"
                  className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors text-center block font-medium"
                >
                  Thanh toán
                </Link>
                <Link
                  to="/shop"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center block font-medium"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
