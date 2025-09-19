import React, { useEffect, useMemo, useState } from 'react';
import Spinner from '../../components/Spinner';
import AdminLayout from '../../components/AdminLayout';
import productAPI from '../../api/productAPI';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth.jsx';
import { formatVnd, parseApiResponse, calculatePagination } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const Products = () => {
  const { handle401Error } = useAuth();

  // Initialize from query string
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const qs = (key, fallback) => params.get(key) ?? fallback;

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // Simplified Filters & Sort
  const [search, setSearch] = useState(qs('q', ''));
  const [category, setCategory] = useState(qs('category', 'all'));
  const [status, setStatus] = useState(qs('status', 'all')); // all | active | inactive
  const [priceSort, setPriceSort] = useState(qs('priceSort', 'none')); // none | asc | desc
  const [timeSort, setTimeSort] = useState(qs('timeSort', 'desc')); // none | asc | desc

  // Pagination
  const [page, setPage] = useState(Number(qs('page', 1)) || 1);
  const [pageSize, setPageSize] = useState(Number(qs('pageSize', 10)) || 10);

  const syncQueryString = () => {
    const sp = new URLSearchParams();
    if (search) sp.set('q', search);
    if (category && category !== 'all') sp.set('category', category);
    if (status && status !== 'all') sp.set('status', status);
    if (priceSort && priceSort !== 'none') sp.set('priceSort', priceSort);
    if (timeSort && timeSort !== 'desc') sp.set('timeSort', timeSort);
    if (page && page !== 1) sp.set('page', String(page));
    if (pageSize && pageSize !== 10) sp.set('pageSize', String(pageSize));
    const qsStr = sp.toString();
    const url = `${window.location.pathname}${qsStr ? `?${qsStr}` : ''}`;
    window.history.replaceState(null, '', url);
  };

  useEffect(() => {
    syncQueryString();
  }, [search, category, status, priceSort, timeSort, page, pageSize]);

  const loadProducts = async (forceReload = false) => {
    // Chỉ load nếu chưa có data hoặc force reload
    if (products.length > 0 && !forceReload) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Use admin endpoint to include inactive items
      const params = {};
      if (category !== 'all') params.category = category;
      if (status === 'active') params.isActive = true;
      if (status === 'inactive') params.isActive = false;
      const res = await productAPI.adminListProducts(params);
      setProducts(parseApiResponse(res));
    } catch (err) {
      if (err?.response?.status === 401) {
        handle401Error();
        return;
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []); // Chỉ chạy 1 lần khi mount

  const handleDelete = async (sku) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    try {
      await productAPI.deleteProduct(sku);
      await loadProducts(true); // Force reload
    } catch (err) {
      if (err?.response?.status === 401) {
        handle401Error();
      }
    }
  };

  const handleToggleVisibility = async (sku) => {
    try {
      await productAPI.toggleProductVisibility(sku);
      await loadProducts(true); // Force reload
      toast.success('Đã cập nhật trạng thái hiển thị');
    } catch (err) {
      if (err?.response?.status === 401) {
        handle401Error();
        return;
      }
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, priceSort, timeSort, pageSize, status]);

  // Build category options from products
  const categories = useMemo(() => {
    const set = new Set();
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let result = Array.isArray(products) ? [...products] : [];

    // search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          String(p.name || '')
            .toLowerCase()
            .includes(q) ||
          String(p.sku || '')
            .toLowerCase()
            .includes(q)
      );
    }

    // category
    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

    // status
    if (status === 'active') {
      result = result.filter((p) => p.isActive !== false);
    } else if (status === 'inactive') {
      result = result.filter((p) => p.isActive === false);
    }

    // Apply sorting
    if (priceSort === 'asc') {
      result.sort((a, b) => {
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;
        return priceA - priceB;
      });
    } else if (priceSort === 'desc') {
      result.sort((a, b) => {
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;
        return priceB - priceA;
      });
    }

    // Apply time sorting (independent of price sorting)
    if (timeSort === 'asc') {
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateA - dateB;
      });
    } else if (timeSort === 'desc') {
      result.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    }

    return result;
  }, [products, search, category, status, priceSort, timeSort]);

  // Pagination
  const total = filteredProducts.length;
  const pagination = calculatePagination(total, page, pageSize);
  const pageItems = filteredProducts.slice(pagination.startIdx, pagination.endIdx);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Quản lý sản phẩm" description="Quản lý danh sách sản phẩm và thông tin chi tiết">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên sản phẩm, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">Tất cả</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hiển thị</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp theo giá</label>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="none">Không sắp xếp</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp theo thời gian</label>
            <select
              value={timeSort}
              onChange={(e) => setTimeSort(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
              <option value="none">Không sắp xếp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách sản phẩm ({total})</h2>
            <Link
              to="/admin/products/new"
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Thêm sản phẩm
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageItems.map((product) => (
                <tr key={product.sku} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {product.media && product.media.length > 0 ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.media[0].url}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.brand || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatVnd(product.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleVisibility(product.sku)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.isActive !== false ? 'Hiển thị' : 'Ẩn'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/products/${product.sku}`}
                        className="text-[rgb(var(--color-primary))] hover:text-pink-900"
                      >
                        Sửa
                      </Link>
                      <button onClick={() => handleDelete(product.sku)} className="text-red-600 hover:text-red-900">
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50]}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Products;
