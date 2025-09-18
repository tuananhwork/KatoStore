import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/Spinner';
import AdminSidebar from '../../components/AdminSidebar';
import productAPI from '../../api/productAPI';
import Pagination from '../../components/Pagination';
import { toast } from 'react-toastify';

const Products = () => {
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const role = user?.role;

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

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Use admin endpoint to include inactive items
      const params = {};
      if (category !== 'all') params.category = category;
      if (status === 'active') params.isActive = true;
      if (status === 'inactive') params.isActive = false;
      const res = await productAPI.adminListProducts(params);
      setProducts(Array.isArray(res?.items) ? res.items : Array.isArray(res?.data) ? res.data : res);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) await loadProducts();
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const formatVnd = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  const handleDelete = async (sku) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    try {
      await productAPI.deleteProduct(sku);
      await loadProducts();
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/auth');
      }
    }
  };

  const handleToggleVisibility = async (sku) => {
    try {
      await productAPI.toggleProductVisibility(sku);
      await loadProducts();
      toast.success('Đã cập nhật trạng thái hiển thị');
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/auth');
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

    // status (client-side safety)
    if (status === 'active') result = result.filter((p) => !!p.isActive);
    if (status === 'inactive') result = result.filter((p) => !p.isActive);

    // sorting
    // Primary: price if selected; Secondary: time if selected
    if (priceSort !== 'none') {
      const dir = priceSort === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const av = Number(a.price || 0);
        const bv = Number(b.price || 0);
        if (av === bv && timeSort !== 'none') {
          const tdir = timeSort === 'asc' ? 1 : -1;
          const ta = new Date(a.createdAt || 0).getTime();
          const tb = new Date(b.createdAt || 0).getTime();
          return (ta - tb) * tdir;
        }
        return (av - bv) * dir;
      });
    } else if (timeSort !== 'none') {
      const dir = timeSort === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const av = new Date(a.createdAt || 0).getTime();
        const bv = new Date(b.createdAt || 0).getTime();
        return (av - bv) * dir;
      });
    }

    return result;
  }, [products, search, category, priceSort, timeSort, status]);

  // Current page slice
  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageItems = filteredProducts.slice(startIdx, endIdx);

  const noAccess = !role || !['admin', 'manager'].includes(role);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <AdminSidebar />
          </div>
          <div className="lg:col-span-3">
            {noAccess ? (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h1>
                  <p className="text-gray-600 mb-6">Trang này chỉ dành cho Admin/Manager</p>
                  <button onClick={() => navigate('/')} className="btn-primary">
                    Về trang chủ
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                  </div>
                  <button className="btn-primary" onClick={() => navigate('/admin/products/new')}>
                    Thêm sản phẩm
                  </button>
                </div>

                {/* Filters & Sort */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                    <div className="lg:col-span-2">
                      <input
                        type="text"
                        placeholder="Tìm theo tên hoặc SKU..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c === 'all' ? 'Tất cả danh mục' : c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Hiển thị</option>
                        <option value="inactive">Ẩn</option>
                      </select>
                    </div>
                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value)}
                      >
                        <option value="none">Giá:</option>
                        <option value="asc">Giá tăng dần</option>
                        <option value="desc">Giá giảm dần</option>
                      </select>
                    </div>
                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        value={timeSort}
                        onChange={(e) => setTimeSort(e.target.value)}
                      >
                        <option value="none">Thời gian:</option>
                        <option value="desc">Mới đến cũ</option>
                        <option value="asc">Cũ đến mới</option>
                      </select>
                    </div>
                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                      >
                        <option value={10}>10 / trang</option>
                        <option value={20}>20 / trang</option>
                        <option value={50}>50 / trang</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    Hiển thị {total === 0 ? 0 : startIdx + 1}-{endIdx} / {total} sản phẩm
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sản phẩm
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Danh mục
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giá
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tồn kho
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center">
                              <Spinner size="lg" />
                            </td>
                          </tr>
                        ) : pageItems.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                              Không có sản phẩm phù hợp
                            </td>
                          </tr>
                        ) : (
                          pageItems.map((product) => (
                            <tr key={product._id || product.sku} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img
                                      className="h-10 w-10 rounded-lg object-cover"
                                      src={product?.media?.[0]?.url || 'https://via.placeholder.com/40x40'}
                                      alt={product.name}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatVnd(product.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  onClick={() => handleToggleVisibility(product.sku)}
                                  className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer select-none transition-colors ${
                                    product.isActive
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  }`}
                                  title={product.isActive ? 'Nhấn để ẩn sản phẩm' : 'Nhấn để hiển thị sản phẩm'}
                                >
                                  {product.isActive ? 'Hiển thị' : 'Ẩn'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-3">
                                <button
                                  className="text-pink-600 hover:text-pink-900"
                                  onClick={() => navigate(`/admin/products/${product.sku}`)}
                                >
                                  Sửa
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => handleDelete(product.sku)}
                                >
                                  Xóa
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <Pagination
                    className="px-4 py-3 border-t border-gray-200 bg-white"
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={[10, 20, 50]}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
