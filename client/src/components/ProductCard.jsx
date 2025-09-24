import React from 'react';
import { Link } from 'react-router-dom';
import { formatVnd } from '../utils/helpers';

const ProductCard = ({ product }) => {
  const { sku, name, price, media } = product;
  const rating = product.rating || 0;
  const reviews = product.reviews || 0;

  const imageUrl =
    Array.isArray(media) && media.length
      ? media.find((m) => m.type === 'image' && m.order === 1)?.url || media[0].url
      : '/api/placeholder/300/300';

  // const onQuickAdd = () => {
  //   addToCart(product, { quantity: 1 });
  //   toast.success('Đã thêm vào giỏ hàng');
  // };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* Product Image */}
      <div className="relative">
        <Link to={`/product/${sku}`}>
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${sku}`}>
          <h3 className="font-semibold text-gray-900 hover:text-[rgb(var(--color-primary))] transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mt-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-1">({reviews})</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">{formatVnd(price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
