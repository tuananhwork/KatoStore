import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { getCart, updateCartItem, removeCartItem } from '../utils/cart';

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

  const formatVnd = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

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

  const subtotal = cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
  const shipping = subtotal > 2000000 ? 0 : 30000;
  const tax = Math.round(subtotal * 0.1);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
            <p className="text-gray-600 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/shop" className="inline-block btn-primary">
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
          <p className="text-gray-600 mt-2">Kiểm tra và chỉnh sửa sản phẩm trong giỏ hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Sản phẩm ({cartItems.length})</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.key} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.sku}`}
                          className="text-lg font-medium text-gray-900 hover:text-pink-600"
                        >
                          {item.name}
                        </Link>
                        {(item.color || item.size) && (
                          <div className="text-sm text-gray-500 mt-1">
                            {item.color && <span>Màu: {item.color}</span>}
                            {item.color && item.size && <span className="mx-2">•</span>}
                            {item.size && <span>Size: {item.size}</span>}
                          </div>
                        )}
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">{formatVnd(item.price)}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Còn lại: {item.stock} sản phẩm</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.key, (item.quantity || 1) - 1, item.stock)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>

                        <span className="w-12 text-center font-medium">{item.quantity}</span>

                        <button
                          onClick={() => updateQuantity(item.key, (item.quantity || 1) + 1, item.stock)}
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button onClick={() => removeItem(item.key)} className="text-pink-600 hover:text-pink-800 p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Tóm tắt đơn hàng</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">{formatVnd(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">{shipping === 0 ? 'Miễn phí' : formatVnd(shipping)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế (10%):</span>
                  <span className="font-medium">{formatVnd(tax)}</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                    <span className="text-lg font-semibold text-gray-900">{formatVnd(total)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link to="/checkout" className="w-full btn-primary text-center block">
                    Thanh toán
                  </Link>
                  <Link
                    to="/shop"
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-pink-50 transition-colors text-center block"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>

                {subtotal < 2000000 && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                    <p className="text-sm text-pink-800">
                      Mua thêm {formatVnd(2000000 - subtotal)} để được miễn phí vận chuyển!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
