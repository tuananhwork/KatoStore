import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { getCart, updateCartItem, removeCartItem } from '../utils/cart';
import { formatVnd } from '../utils/helpers';
import { CART } from '../utils/constants';
import productAPI from '../api/productAPI';
import { getVariantStock } from '../utils/variants';
import { calcTotals } from '../utils/pricing';
import OrderSummary from '../components/OrderSummary';
import QuantityInput from '../components/QuantityInput';

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState({}); // Store full product data

  const loadCart = async () => {
    const items = await getCart();
    setCartItems(items);

    // Load full product data for variants
    const productData = {};
    for (const item of items) {
      if (!productData[item.sku]) {
        try {
          const res = await productAPI.getProductBySku(item.sku);
          productData[item.sku] = res;
        } catch (error) {
          console.error('Failed to load product:', item.sku, error);
        }
      }
    }
    setProducts(productData);
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

  const updateQuantity = async (key, newQuantity, stock) => {
    if (newQuantity < 1) return;
    const clamped = Math.min(newQuantity, stock || 9999);
    const items = await updateCartItem(key, clamped);
    setCartItems(items);
  };

  const removeItem = async (key) => {
    const items = await removeCartItem(key);
    setCartItems(items);
  };

  const getVariantStockForProduct = (sku, color, size) => getVariantStock(products[sku], color, size);

  const { subtotal, shipping, tax, total } = calcTotals(cartItems);

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-alt))] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-alt))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-[rgb(var(--color-text-light))] text-6xl mb-4">🛒</div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-2">Giỏ hàng trống</h1>
            <p className="text-[rgb(var(--color-text-muted))] mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link
              to="/shop"
              className="bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-light))] px-6 py-3 rounded-lg hover:bg-[rgb(var(--color-primary-600))] transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-alt))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-2">Giỏ hàng</h1>
          <p className="text-[rgb(var(--color-text-muted))]">Kiểm tra và chỉnh sửa sản phẩm trong giỏ hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-[rgb(var(--color-border))] overflow-hidden">
              <div className="px-6 py-4 border-b border-[rgb(var(--color-border))]">
                <h2 className="text-lg font-semibold text-[rgb(var(--color-text))]">Sản phẩm ({cartItems.length})</h2>
              </div>
              <div className="divide-y divide-[rgb(var(--color-border))]">
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
                        <h3 className="text-sm font-medium text-[rgb(var(--color-text))] line-clamp-2">{item.name}</h3>
                        <p className="text-sm text-[rgb(var(--color-text-muted))]">SKU: {item.sku}</p>

                        <div className="mt-2 flex items-center space-x-4 text-xs text-[rgb(var(--color-text-light))]">
                          {item.color && (
                            <span className="bg-[rgb(var(--color-bg-alt))] px-2 py-1 rounded">
                              Màu: <span className="font-medium">{item.color}</span>
                            </span>
                          )}
                          {item.size && (
                            <span className="bg-[rgb(var(--color-bg-alt))] px-2 py-1 rounded">
                              Size: <span className="font-medium">{item.size}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-[rgb(var(--color-text))]">{formatVnd(item.price)}</p>
                          <p className="text-sm text-[rgb(var(--color-text-muted))]">
                            Còn {getVariantStockForProduct(item.sku, item.color, item.size)} sản phẩm
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <QuantityInput
                            value={item.quantity}
                            onChange={(q) =>
                              updateQuantity(item.key, q, getVariantStockForProduct(item.sku, item.color, item.size))
                            }
                            min={1}
                            max={getVariantStockForProduct(item.sku, item.color, item.size)}
                          />
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="text-[rgb(var(--color-error))] hover:text-[rgb(var(--color-error))] text-sm font-medium"
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
            <OrderSummary title="Tóm tắt đơn hàng" subtotal={subtotal} shipping={shipping} tax={tax} total={total}>
              {subtotal < CART.FREE_SHIPPING_THRESHOLD && (
                <div className="mt-4 p-3 bg-[rgb(var(--color-info)/0.15)] rounded-lg">
                  <p className="text-sm text-[rgb(var(--color-info))]">
                    Mua thêm {formatVnd(CART.FREE_SHIPPING_THRESHOLD - subtotal)} để được miễn phí vận chuyển!
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <Link
                  to="/checkout"
                  className="w-full bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-light))] py-3 px-4 rounded-lg hover:bg-[rgb(var(--color-primary-600))] transition-colors text-center block font-medium"
                >
                  Thanh toán
                </Link>
                <Link
                  to="/shop"
                  className="w-full bg-[rgb(var(--color-bg-alt))] text-[rgb(var(--color-text))] py-3 px-4 rounded-lg hover:bg-[rgb(var(--color-bg))] transition-colors text-center block font-medium"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </OrderSummary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
