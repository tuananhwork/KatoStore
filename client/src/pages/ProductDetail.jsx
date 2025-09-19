import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productAPI from '../api/productAPI';
import Spinner from '../components/Spinner';
import ProductCard from '../components/ProductCard';
import { addToCart } from '../utils/cart';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    (async () => {
      try {
        const [listRes, itemRes] = await Promise.all([
          productAPI.listProducts(),
          productAPI.getProductBySku(id),
        ]);
        if (!isMounted) return;
        setProducts(listRes?.items || []);
        setProduct(itemRes || null);
      } catch {
        if (!isMounted) return;
        setProducts([]);
        setProduct(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const mediaImages = useMemo(() => {
    if (!product || !Array.isArray(product.media)) return [];
    return product.media
      .filter((m) => m.type === 'image')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product || !Array.isArray(product.variants)) return [];
    return Array.from(
      new Set(product.variants.map((v) => v.color).filter(Boolean))
    );
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product || !Array.isArray(product.variants)) return [];
    return Array.from(
      new Set(product.variants.map((v) => v.size).filter(Boolean))
    );
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.sku !== product.sku && p.category === product.category)
      .slice(0, 3);
  }, [products, product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (availableColors.length > 0 && !selectedColor) {
      toast.info('Vui lòng chọn màu');
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      toast.info('Vui lòng chọn kích thước');
      return;
    }
    addToCart(product, {
      quantity,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    });
    toast.success('Đã thêm vào giỏ hàng');
    navigate('/cart');
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (product && newQuantity >= 1 && newQuantity <= (product.stock || 1))
      setQuantity(newQuantity);
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const formatVnd = (v) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(v);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-[rgb(var(--color-primary))]">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[rgb(var(--color-primary))]">
            Cửa hàng
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="mb-4">
              <img
                src={
                  mediaImages[selectedImage]?.url ||
                  mediaImages[0]?.url ||
                  '/api/placeholder/600/600'
                }
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
            {mediaImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {mediaImages.map((m, idx) => (
                  <button
                    key={m.url}
                    onClick={() => setSelectedImage(idx)}
                    className={`border rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      selectedImage === idx ? 'ring-2 ring-pink-600' : ''
                    }`}
                  >
                    <img
                      src={m.url}
                      alt={`thumb-${idx + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatVnd(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatVnd(product.originalPrice)}
                    </span>
                    {product.discount ? (
                      <span className="bg-pink-100 text-pink-800 text-sm font-medium px-2 py-1 rounded">
                        -{product.discount}%
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            {availableColors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Màu sắc:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1 rounded border text-sm ${
                        selectedColor === color
                          ? 'border-pink-600 text-[rgb(var(--color-primary))]'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableSizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Kích thước:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 rounded border text-sm ${
                        selectedSize === size
                          ? 'border-pink-600 text-[rgb(var(--color-primary))]'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Số lượng:
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.stock || 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span className="text-sm text-gray-500">
                  ({product.stock} có sẵn)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={handleAddToCart} className="w-full btn-primary">
                Thêm vào giỏ hàng
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-pink-50 transition-colors">
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-pink-600 text-[rgb(var(--color-primary))]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'description' && 'Mô tả'}
                  {tab === 'specifications' && 'Thông số kỹ thuật'}
                  {tab === 'reviews' && 'Đánh giá'}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {activeTab === 'description' && (
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            )}
            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">
                    Thương hiệu:
                  </span>
                  <span className="text-gray-900">
                    {product.brand || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Danh mục:</span>
                  <span className="text-gray-900">{product.category}</span>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="text-gray-700">Chưa có đánh giá.</div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((related) => (
              <ProductCard key={related.sku} product={related} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
