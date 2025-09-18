import React, { useEffect, useMemo, useState } from 'react';
import productAPI from '../api/productAPI';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

const Shop = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Remove Vietnamese diacritics and lowercase
  const normalizeText = (s) =>
    String(s || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .toLowerCase();

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await productAPI.listProducts();
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res)
          ? res
          : [];
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
    return [{ value: 'all', label: 'Tất cả' }, ...list.map((c) => ({ value: c, label: c }))];
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
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }
    return result;
  }, [products, filterCategory, sortBy, search]);

  // slice for current page
  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageItems = filteredProducts.slice(startIdx, endIdx);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cửa hàng</h1>
          <p className="text-gray-600">Khám phá tất cả sản phẩm của chúng tôi</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Danh mục:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Sắp xếp:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {[
                  { value: 'newest', label: 'Mới nhất' },
                  { value: 'price-low', label: 'Giá thấp đến cao' },
                  { value: 'price-high', label: 'Giá cao đến thấp' },
                  { value: 'rating', label: 'Đánh giá cao nhất' },
                ].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Tìm theo tên hoặc SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <div className="text-sm text-gray-600">
                Hiển thị {total === 0 ? 0 : startIdx + 1}-{endIdx} / {total} sản phẩm
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageItems.map((product) => (
                <ProductCard key={product.sku} product={product} />
              ))}
            </div>
            <Pagination
              className="mt-6"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[8, 12, 16, 24]}
            />
          </>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</div>
            <p className="text-gray-400 mt-2">Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
