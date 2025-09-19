import React, { useEffect, useMemo, useState } from 'react';
import productAPI from '../api/productAPI';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import {
  parseApiResponse,
  normalizeText,
  calculatePagination,
} from '../utils/helpers';

const Shop = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await productAPI.listProducts();
        const items = parseApiResponse(res);
        if (isMounted) setProducts(items);
      } catch {
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterCategory, sortBy, pageSize, search]);

  const categories = useMemo(() => {
    const set = new Set();
    for (const p of Array.isArray(products) ? products : []) {
      if (p?.category) set.add(p.category);
    }
    const list = Array.from(set);
    return [
      { value: 'all', label: 'Tất cả' },
      ...list.map((c) => ({ value: c, label: c })),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = Array.isArray(products) ? [...products] : [];

    // search by name or SKU (accent-insensitive for name)
    const q = normalizeText(search).trim();
    if (q) {
      result = result.filter((p) => {
        const nameNorm = normalizeText(p.name);
        const skuNorm = normalizeText(p.sku);
        return nameNorm.includes(q) || skuNorm.includes(q);
      });
    }

    if (filterCategory !== 'all') {
      result = result.filter((p) => p.category === filterCategory);
    }
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // newest: by createdAt desc if present, else keep order
        result.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
    }
    return result;
  }, [products, filterCategory, sortBy, search]);

  // slice for current page
  const total = filteredProducts.length;
  const pagination = calculatePagination(total, page, pageSize);
  const pageItems = filteredProducts.slice(
    pagination.startIdx,
    pagination.endIdx
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cửa hàng</h1>
          <p className="text-gray-600">
            Khám phá các sản phẩm thời trang đẹp nhất
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tên sản phẩm, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-low">Giá thấp đến cao</option>
                <option value="price-high">Giá cao đến thấp</option>
                <option value="rating">Đánh giá cao</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hiển thị
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
              >
                <option value={12}>12 sản phẩm</option>
                <option value={24}>24 sản phẩm</option>
                <option value={48}>48 sản phẩm</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Hiển thị {pagination.startIdx + 1}-{pagination.endIdx} trong tổng số{' '}
            {total} sản phẩm
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : pageItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {pageItems.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[12, 24, 48]}
          />
        )}
      </div>
    </div>
  );
};

export default Shop;
