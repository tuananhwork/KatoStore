import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productAPI from '../api/productAPI';
import Spinner from '../components/Spinner';
import ProductCard from '../components/ProductCard';
import { addToCart } from '../utils/cart';
import { toast } from 'react-toastify';
import { formatVnd } from '../utils/helpers';
import {
  getAvailableColors,
  getAvailableSizes,
  getVariantStock,
  filterColorsBySize,
  filterSizesByColor,
} from '../utils/variants';
import { useAuth } from '../hooks/useAuth';
import QuantityInput from '../components/QuantityInput';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
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
        const [listRes, itemRes] = await Promise.all([productAPI.listProducts(), productAPI.getProductBySku(id)]);
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
    return product.media.filter((m) => m.type === 'image').sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [product]);

  // All available options
  const allColors = useMemo(() => getAvailableColors(product), [product]);
  const allSizes = useMemo(() => getAvailableSizes(product), [product]);

  // Use shared helpers to filter options dynamically
  const colorsFiltered = useMemo(() => filterColorsBySize(product, selectedSize), [product, selectedSize]);
  const sizesFiltered = useMemo(() => filterSizesByColor(product, selectedColor), [product, selectedColor]);

  const selectedVariantStock = useMemo(
    () => getVariantStock(product, selectedColor, selectedSize),
    [product, selectedColor, selectedSize]
  );

  // Check if user can add to cart
  const canAddToCart = useMemo(() => {
    if (!product) return false;

    // If no variants, always allow
    if (!product.variants || product.variants.length === 0) {
      return true;
    }

    // If variants exist, require both color and size
    return selectedColor && selectedSize && selectedVariantStock > 0;
  }, [product, selectedColor, selectedSize, selectedVariantStock]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.sku !== product.sku && p.category === product.category).slice(0, 3);
  }, [products, product]);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    // If current size is incompatible with new color, clear it
    if (selectedSize) {
      const stillValid = (product?.variants || []).some(
        (v) => v.color === color && v.size === selectedSize && (v.stock || 0) > 0
      );
      if (!stillValid) setSelectedSize('');
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    // If current color is incompatible with new size, clear it
    if (selectedColor) {
      const stillValid = (product?.variants || []).some(
        (v) => v.size === size && v.color === selectedColor && (v.stock || 0) > 0
      );
      if (!stillValid) setSelectedColor('');
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/auth');
      return;
    }

    if (!product) return;

    if ((product.variants || []).length > 0) {
      if (!selectedColor) {
        toast.info('Vui lòng chọn màu');
        return;
      }
      if (!selectedSize) {
        toast.info('Vui lòng chọn kích thước');
        return;
      }
    }

    await addToCart(product, {
      quantity,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    });
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleQuantityChange = (newQuantity) => {
    const maxStock = selectedVariantStock;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center space-x-2 text-sm text-[rgb(var(--color-text-light))] mb-8">
          <Link to="/" className="hover:text-[rgb(var(--color-primary))]">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[rgb(var(--color-primary))]">
            Cửa hàng
          </Link>
          <span>/</span>
          <span className="text-[rgb(var(--color-text))]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="mb-4">
              <div className="w-full aspect-square overflow-hidden rounded-lg shadow-lg">
                <img
                  src={mediaImages[selectedImage]?.url || mediaImages[0]?.url || '/api/placeholder/600/600'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {mediaImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {mediaImages.map((m, idx) => (
                  <button
                    key={m.url}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square border rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      selectedImage === idx ? 'ring-2 ring-pink-600' : ''
                    }`}
                  >
                    <img src={m.url} alt={`thumb-${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-[rgb(var(--color-text))] mb-2">{product.name}</h1>

              <div className="flex items-center mb-4">
                <span className="text-sm text-[rgb(var(--color-text-muted))] ml-2">SKU: {product.sku}</span>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-[rgb(var(--color-text))]">{formatVnd(product.price)}</span>

                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-[rgb(var(--color-text-muted))] line-through">
                      {formatVnd(product.originalPrice)}
                    </span>
                    {product.discount ? (
                      <span className="bg-[rgb(var(--color-primary-50))] text-[rgb(var(--color-primary-700))] text-sm font-medium px-2 py-1 rounded">
                        -{product.discount}%
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            {/* Color Selection */}
            {allColors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-[rgb(var(--color-text))] mb-3">Màu sắc:</h3>
                <div className="flex flex-wrap gap-2">
                  {colorsFiltered.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`px-3 py-1 rounded border text-sm transition-colors ${
                        selectedColor === color
                          ? 'border-[rgb(var(--color-primary-600))] bg-[rgb(var(--color-primary-50))] text-[rgb(var(--color-primary-700))]'
                          : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:border-[rgb(var(--color-primary-400))]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {allSizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-[rgb(var(--color-text))] mb-3">Kích thước:</h3>
                <div className="flex flex-wrap gap-2">
                  {sizesFiltered.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`px-3 py-1 rounded border text-sm transition-colors ${
                        selectedSize === size
                          ? 'border-[rgb(var(--color-primary-600))] bg-[rgb(var(--color-primary-50))] text-[rgb(var(--color-primary-700))]'
                          : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:border-[rgb(var(--color-primary-400))]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[rgb(var(--color-text))] mb-3">Số lượng:</h3>
              <div className="flex items-center space-x-3">
                <QuantityInput
                  value={quantity}
                  onChange={handleQuantityChange}
                  min={1}
                  max={selectedVariantStock || 0}
                />
                <span className="text-sm text-[rgb(var(--color-text-muted))]">({selectedVariantStock} có sẵn)</span>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={handleAddToCart} className="w-full btn-primary" disabled={isLoggedIn && !canAddToCart}>
                {!isLoggedIn
                  ? 'Đăng nhập để mua hàng'
                  : !canAddToCart
                  ? 'Vui lòng chọn màu và size'
                  : 'Thêm vào giỏ hàng'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[rgb(var(--color-bg))] rounded-lg shadow mb-16">
          <div className="border-b border-[rgb(var(--color-border))]">
            <nav className="flex space-x-8 px-4">
              {['description', 'specifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-[rgb(var(--color-primary-600))] text-[rgb(var(--color-primary-700))]'
                      : 'border-transparent text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] hover:border-[rgb(var(--color-border))]'
                  }`}
                >
                  {tab === 'description' && 'Mô tả'}
                  {tab === 'specifications' && 'Thông số kỹ thuật'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <p className="text-[rgb(var(--color-text))] leading-relaxed">{product.description}</p>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                  <span className="font-medium text-[rgb(var(--color-text-light))]">Thương hiệu:</span>
                  <span className="text-[rgb(var(--color-text))]">{product.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                  <span className="font-medium text-[rgb(var(--color-text-light))]">Danh mục:</span>
                  <span className="text-[rgb(var(--color-text))]">{product.category}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[rgb(var(--color-text))] mb-8">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((related) => (
              <ProductCard key={`${related.sku}`} product={related} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
