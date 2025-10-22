import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import productAPI from '../api/productAPI';
import Spinner from '../components/Spinner';
import { parseApiResponse } from '../utils/helpers';
import { useApiState } from '../hooks/useApi';
import ProductsGrid from '../components/ProductsGrid';
import { Truck, ShieldCheck, Headphones } from 'lucide-react';

const Home = () => {
  // Memoize the API function to prevent re-creation on every render
  const fetchProducts = useCallback(() => productAPI.listProducts({ limit: 20 }), []);

  const { data: products, loading, error } = useApiState(fetchProducts, parseApiResponse);

  const featuredProducts = products?.slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-alt))]">
      <section className="bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-text))] py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Chào mừng đến với KatoStore</h1>
          <p className="text-xl md:text-2xl mb-8 text-[rgb(var(--color-text)/0.8)]">
            Khám phá những sản phẩm thời trang mang phong cách Vintage
          </p>
          <Link
            to="/shop"
            className="inline-block bg-[rgb(var(--color-text))] text-[rgb(var(--color-primary))] px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[rgb(var(--color-text)/0.85)] transition-colors"
          >
            Mua sắm ngay
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[rgb(var(--color-primary)/0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[rgb(var(--color-primary)/0.2)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-[rgb(var(--color-primary))]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[rgb(var(--color-text))]">Giao hàng nhanh</h3>
              <p className="text-[rgb(var(--color-text)/0.7)]">Giao hàng trong 24h tại TP.HCM</p>
            </div>

            <div className="text-center">
              <div className="bg-[rgb(var(--color-primary)/0.2)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-[rgb(var(--color-primary-600))]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[rgb(var(--color-text))]">Chất lượng đảm bảo</h3>
              <p className="text-[rgb(var(--color-text)/0.7)]">Sản phẩm chính hãng 100%</p>
            </div>

            <div className="text-center">
              <div className="bg-[rgb(var(--color-primary)/0.2)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-[rgb(var(--color-primary-700))]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[rgb(var(--color-text))]">Hỗ trợ 24/7</h3>
              <p className="text-[rgb(var(--color-text)/0.7)]">Đội ngũ CSKH chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-[rgb(var(--color-bg))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-4">Sản phẩm nổi bật</h2>
            <p className="text-[rgb(var(--color-text)/0.7)]">Những sản phẩm được yêu thích nhất</p>
          </div>

          {loading ? (
            <Spinner />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-[rgb(var(--color-text)/0.6)]">Không thể tải sản phẩm. Vui lòng thử lại sau.</p>
            </div>
          ) : (
            <ProductsGrid products={featuredProducts} />
          )}

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-block bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-light))] px-8 py-3 rounded-lg font-semibold hover:bg-[rgb(var(--color-primary-600))] transition-colors"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
