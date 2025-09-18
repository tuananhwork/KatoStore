import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/AdminSidebar';
import mediaAPI from '../../api/mediaAPI';
import productAPI from '../../api/productAPI';
import { useRef } from 'react';

const ProductForm = () => {
  const navigate = useNavigate();
  const { sku: routeSku } = useParams();
  const isEdit = !!routeSku;
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const role = user?.role;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    originalPrice: '',
    discount: '',
    stock: '',
    isActive: true,
    rating: '',
    reviews: '',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  // Cloudinary folder is derived from category
  const computedFolder = useMemo(() => `katostore/${(form.category || 'uncategorized').trim()}`, [form.category]);
  const [variants, setVariants] = useState([{ color: '', size: '', stock: '' }]);

  const [allCategories, setAllCategories] = useState([]);
  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Preview states
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  // Refs for hidden inputs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handlePickImages = () => imageInputRef.current?.click();
  const handlePickVideos = () => videoInputRef.current?.click();
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };
  const handleVideosChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setVideoFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  // SKU suggestion state
  const [skuSuggestion, setSkuSuggestion] = useState('');
  const categoryToPrefix = useMemo(
    () => ({
      Tops: 'top',
      Outerwear: 'out',
      Skirts: 'ski',
      Pants: 'pan',
      Boots: 'bot',
      Shoes: 'sho',
      Sandals: 'san',
      Slides: 'sli',
    }),
    []
  );

  const normalize = (text) =>
    String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '');

  const getPrefixFromCategory = (category) => {
    if (!category) return '';
    const mapped = categoryToPrefix[category];
    if (mapped) return mapped;
    const slug = normalize(category);
    const cand = slug.slice(0, 3);
    return cand || 'prd';
  };

  const computeNextSku = async (category) => {
    try {
      const prefix = getPrefixFromCategory(category);
      if (!prefix) return '';
      const res = await productAPI.listProducts();
      const items = Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      const nums = items
        .map((p) => String(p?.sku || ''))
        .filter((s) => s.startsWith(`${prefix}-`))
        .map((s) => {
          const part = s.slice(prefix.length + 1);
          const m = part.match(/^(\d{1,})$/);
          return m ? parseInt(m[1], 10) : NaN;
        })
        .filter((n) => Number.isFinite(n));
      const max = nums.length ? Math.max(...nums) : 0;
      const next = max + 1;
      const padded = String(next).padStart(4, '0');
      return `${prefix}-${padded}`;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    let mounted = true;
    // Load categories from existing products
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
        if (mounted) {
          const set = new Set(items.map((p) => p.category).filter(Boolean));
          setAllCategories(Array.from(set));
        }
      } catch {
        if (mounted) setAllCategories([]);
      }
    })();

    if (!isEdit)
      return () => {
        mounted = false;
      };
    (async () => {
      try {
        const p = await productAPI.getProductBySku(routeSku);
        if (!mounted) return;
        setForm({
          sku: p.sku,
          name: p.name || '',
          description: p.description || '',
          category: p.category || '',
          brand: p.brand || '',
          price: p.price ?? '',
          originalPrice: p.originalPrice ?? '',
          discount: p.discount ?? '',
          stock: p.stock ?? '',
          isActive: !!p.isActive,
          rating: p.rating ?? '',
          reviews: p.reviews ?? '',
        });
        setVariants(
          (p.variants && p.variants.length ? p.variants : [{ color: '', size: '', stock: '' }]).map((v) => ({
            color: v.color || '',
            size: v.size || '',
            stock: v.stock ?? '',
          }))
        );
      } catch {
        toast.error('Không tải được sản phẩm');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isEdit, routeSku]);

  // Auto-suggest SKU when category changes (create mode only)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isEdit) return;
      const category = form.category;
      if (!category) {
        setSkuSuggestion('');
        return;
      }
      const nextSku = await computeNextSku(category);
      if (cancelled) return;
      setSkuSuggestion(nextSku);
      if (nextSku) {
        const prefix = getPrefixFromCategory(category).toLowerCase();
        const currentPrefix = (form.sku || '').split('-')[0]?.toLowerCase();
        if (!form.sku || currentPrefix !== prefix) {
          setForm((prev) => ({ ...prev, sku: nextSku }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form.category, isEdit]);

  // Generate and clean up preview URLs for images
  useEffect(() => {
    const urls = (imageFiles || []).map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setImagePreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u.url));
    };
  }, [imageFiles]);

  // Generate and clean up preview URLs for videos
  useEffect(() => {
    const urls = (videoFiles || []).map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setVideoPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u.url));
    };
  }, [videoFiles]);

  if (!role || !['admin', 'manager'].includes(role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-6">Trang này chỉ dành cho Admin/Manager</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const updateVariant = (index, key, value) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)));
  };

  const addVariant = () => setVariants((prev) => [...prev, { color: '', size: '', stock: '' }]);
  const removeVariant = (index) => setVariants((prev) => prev.filter((_, i) => i !== index));

  const removeImageAt = (idx) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeVideoAt = (idx) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sku || !form.name || !form.category || !form.price) {
      toast.error('Vui lòng điền SKU, Tên, Danh mục và Giá');
      return;
    }
    if (!isEdit && imageFiles.length === 0 && videoFiles.length === 0) {
      toast.info('Vui lòng chọn ít nhất 1 media (ảnh hoặc video)');
      return;
    }
    setSubmitting(true);
    try {
      // Upload new media if provided
      let media = undefined;
      if (imageFiles.length > 0 || videoFiles.length > 0) {
        const uploads = [];
        const baseId = `${(form.category || 'uncategorized').toLowerCase()}/${(form.sku || 'temp').toLowerCase()}`;
        if (imageFiles.length > 0) {
          const publicIds = imageFiles.map((_, idx) => `${baseId}/${(form.sku || 'temp').toLowerCase()}_${idx + 1}`);
          uploads.push(
            mediaAPI.uploadMultiple(imageFiles, {
              type: 'image',
              folder: `katostore`,
              publicIds,
              overwrite: true,
            })
          );
        }
        if (videoFiles.length > 0) {
          const publicIds = videoFiles.map(
            (_, idx) => `${baseId}/${(form.sku || 'temp').toLowerCase()}_video_${idx + 1}`
          );
          uploads.push(
            mediaAPI.uploadMultiple(videoFiles, {
              type: 'video',
              folder: `katostore`,
              publicIds,
              overwrite: true,
            })
          );
        }
        const settled = await Promise.all(uploads);
        const flat = settled.flat();
        media = flat
          .sort((a, b) => (a.resourceType === b.resourceType ? 0 : a.resourceType === 'image' ? -1 : 1))
          .map((m, idx) => ({ url: m.url, type: m.resourceType, order: idx + 1 }));
      }

      const payload = {
        sku: (form.sku || '').trim().toLowerCase(),
        name: form.name,
        description: form.description,
        category: form.category,
        brand: form.brand || undefined,
        price: Number(form.price) || 0,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        discount: form.discount ? Number(form.discount) : undefined,
        stock: Number(form.stock) || 0,
        isActive: !!form.isActive,
        rating: form.rating ? Number(form.rating) : undefined,
        reviews: form.reviews ? Number(form.reviews) : undefined,
        variants: variants
          .filter((v) => v.color || v.size)
          .map((v) => ({
            color: v.color || undefined,
            size: v.size || undefined,
            stock: v.stock ? Number(v.stock) : 0,
          })),
        ...(media ? { media } : {}),
      };

      if (isEdit) {
        await productAPI.updateProduct(routeSku, payload);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productAPI.createProduct(payload);
        toast.success('Tạo sản phẩm thành công');
      }
      navigate('/admin/products');
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/auth');
        return;
      }
      if (err?.response?.status === 409) {
        toast.error('SKU đã tồn tại');
        return;
      }
      toast.error(err?.response?.data?.message || (isEdit ? 'Cập nhật sản phẩm thất bại' : 'Tạo sản phẩm thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <AdminSidebar />
          </div>
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>

            {loading ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-500">Đang tải...</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU <span className="text-red-600">*</span>
                    </label>
                    <input
                      name="sku"
                      value={form.sku}
                      onChange={onChange}
                      disabled={isEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                    {!isEdit && skuSuggestion && (
                      <p className="text-xs text-gray-500 mt-1">
                        Gợi ý SKU tiếp theo: <span className="font-medium">{skuSuggestion}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên sản phẩm <span className="text-red-600">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục <span className="text-red-600">*</span>
                    </label>
                    {!addingNewCategory ? (
                      <div className="flex items-center gap-2">
                        <select
                          name="category"
                          value={form.category}
                          onChange={onChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        >
                          <option value="">-- Chọn danh mục --</option>
                          {allCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="text-pink-600 hover:text-pink-800 whitespace-nowrap"
                          onClick={() => {
                            setAddingNewCategory(true);
                            setNewCategory('');
                          }}
                        >
                          + Thêm
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          placeholder="Nhập danh mục mới"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        />
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => {
                            const cat = (newCategory || '').trim();
                            if (!cat) return;
                            if (!allCategories.includes(cat)) setAllCategories((prev) => [...prev, cat]);
                            setForm((prev) => ({ ...prev, category: cat }));
                            setAddingNewCategory(false);
                          }}
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          className="px-3 py-2 rounded-lg border border-gray-300"
                          onClick={() => setAddingNewCategory(false)}
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text_sm font-medium text-gray-700 mb-2">Thương hiệu</label>
                    <input
                      name="brand"
                      value={form.brand}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá <span className="text-red-600">*</span>
                    </label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá gốc</label>
                    <input
                      name="originalPrice"
                      type="number"
                      min="0"
                      value={form.originalPrice}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giảm (%)</label>
                    <input
                      name="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={form.discount}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tồn kho</label>
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh (có thể nhiều)</label>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="hidden"
                    />
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 cursor-pointer"
                      onClick={handlePickImages}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 15a4 4 0 004 4h10a4 4 0 004-4V8a4 4 0 00-4-4H7a4 4 0 00-4 4v7z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 11l2 2 4-4m2 8H8a2 2 0 01-2-2"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-700">
                          Kéo thả hoặc <span className="text-pink-600 font-medium">bấm để chọn ảnh</span>
                        </p>
                        <p className="text-xs text-gray-500">Hỗ trợ PNG, JPG, WEBP • Có thể chọn nhiều</p>
                        {imageFiles.length > 0 && (
                          <p className="mt-1 text-xs text-gray-600">Đã chọn: {imageFiles.length} file</p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <button type="button" className="btn-primary" onClick={handlePickImages}>
                            Chọn ảnh
                          </button>
                          {imageFiles.length > 0 && (
                            <button
                              type="button"
                              className="px-3 py-2 rounded-lg border border-gray-300"
                              onClick={() => setImageFiles([])}
                            >
                              Xóa tất cả
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {imagePreviews.map((p, idx) => (
                          <div key={idx} className="relative group">
                            <img src={p.url} alt={p.name} className="w-full h-24 object-cover rounded" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImageAt(idx);
                              }}
                              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                              title="Xóa ảnh này"
                            >
                              Xóa
                            </button>
                            <div className="mt-1 text-xs text-gray-600 truncate" title={p.name}>
                              {p.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video (có thể nhiều)</label>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleVideosChange}
                      className="hidden"
                    />
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 cursor-pointer"
                      onClick={handlePickVideos}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14"
                          />
                          <rect x="3" y="6" width="12" height="12" rx="2" ry="2" strokeWidth="2" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-700">
                          Kéo thả hoặc <span className="text-pink-600 font-medium">bấm để chọn video</span>
                        </p>
                        <p className="text-xs text-gray-500">Hỗ trợ MP4, WebM • Có thể chọn nhiều</p>
                        {videoFiles.length > 0 && (
                          <p className="mt-1 text-xs text-gray-600">Đã chọn: {videoFiles.length} file</p>
                        )}
                        <div className="mt-3 flex gap-2">
                          <button type="button" className="btn-primary" onClick={handlePickVideos}>
                            Chọn video
                          </button>
                          {videoFiles.length > 0 && (
                            <button
                              type="button"
                              className="px-3 py-2 rounded-lg border border-gray-300"
                              onClick={() => setVideoFiles([])}
                            >
                              Xóa tất cả
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {videoPreviews.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {videoPreviews.map((p, idx) => (
                          <div key={idx} className="relative group">
                            <video src={p.url} className="w-40 h-40 rounded" controls muted />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeVideoAt(idx);
                              }}
                              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                              title="Xóa video này"
                            >
                              Xóa
                            </button>
                            <div className="mt-1 text-xs text-gray-600 truncate" title={p.name}>
                              {p.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-xs text-gray-500">
                      Tệp sẽ được lưu tại: <span className="font-medium">{computedFolder}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Biến thể (màu/kích thước/tồn)</label>
                    <button type="button" onClick={addVariant} className="text-pink-600 hover:text-pink-800 text-sm">
                      + Thêm biến thể
                    </button>
                  </div>
                  <div className="space-y-3">
                    {variants.map((v, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          placeholder="Màu"
                          value={v.color}
                          onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        />
                        <input
                          placeholder="Kích thước"
                          value={v.size}
                          onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        />
                        <input
                          placeholder="Tồn kho"
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  <div className="flex items-center space-x-2">
                    <input id="isActive" name="isActive" type="checkbox" checked={form.isActive} onChange={onChange} />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Hiển thị
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
                    <input
                      name="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={form.rating}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reviews</label>
                    <input
                      name="reviews"
                      type="number"
                      min="0"
                      value={form.reviews}
                      onChange={onChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-gray-300"
                    onClick={() => navigate('/admin/products')}
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting
                      ? isEdit
                        ? 'Đang cập nhật...'
                        : 'Đang lưu...'
                      : isEdit
                      ? 'Cập nhật sản phẩm'
                      : 'Lưu sản phẩm'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
