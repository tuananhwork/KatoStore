import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import orderAPI from '../api/orderAPI';
import mediaAPI from '../api/mediaAPI';
import authAPI from '../api/authAPI';
import apiClient from '../api/client';
import { getOrderStatusText, formatVnd, parseApiResponse } from '../utils/helpers';
import { handleError } from '../utils/toast';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, syncAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressStreet: '',
    city: '',
    postalCode: '',
    country: 'Vietnam',
    dateOfBirth: '',
    gender: 'other',
    avatar: '/images/Avatar/avt.jpg',
  });
  const [orders, setOrders] = useState([]);

  const baseURL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    // Initialize tab from query param
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['profile', 'orders', 'wishlist', 'settings'].includes(tab)) {
        setActiveTab(tab);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        toast.info('Vui lòng đăng nhập');
        navigate('/auth?mode=login');
        return;
      }
      setLoading(true);
      try {
        const u = await authAPI.getMe();
        setUserInfo((prev) => ({
          ...prev,
          name: u.name || prev.name,
          firstName: u.firstName || prev.firstName,
          lastName: u.lastName || prev.lastName,
          email: u.email || prev.email,
          phone: u.phone || '',
          avatar: u.avatar || prev.avatar,
          dateOfBirth: u.dateOfBirth ? String(u.dateOfBirth).slice(0, 10) : '',
          gender: u.gender || 'other',
          addressStreet: u.address?.street || prev.addressStreet,
          city: u.address?.city || prev.city,
          postalCode: u.address?.postalCode || prev.postalCode,
          country: u.address?.country || prev.country,
        }));
      } catch (err) {
        handleError(err, 'Không thể tải thông tin người dùng');
        if (err?.response?.status === 401) {
          navigate('/auth?mode=login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, baseURL, user]);

  useEffect(() => {
    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await orderAPI.getMyOrders();
        const data = parseApiResponse(res); // Use helper
        setOrders(data);
      } catch (error) {
        handleError(error, 'Không thể tải danh sách đơn hàng');
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    if (activeTab === 'orders') loadOrders();
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUploadAvatar = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    setUploadingAvatar(true);
    try {
      const [result] = await mediaAPI.uploadAvatarMultiple([file], {
        type: 'image',
        folder: 'katostore/avatars',
      });
      if (result?.url) {
        // Update local UI immediately
        setUserInfo((prev) => ({ ...prev, avatar: result.url }));
        // Persist to server so it survives reload
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          await apiClient.patch(`/auth/me`, { avatar: result.url });
          // Sync localStorage user for Header/avatar
          try {
            const raw = localStorage.getItem('user');
            const u = raw ? JSON.parse(raw) : null;
            if (u) {
              u.avatar = result.url;
              localStorage.setItem('user', JSON.stringify(u));
              window.dispatchEvent(new StorageEvent('storage', { key: 'user' }));
            }
          } catch {
            // ignore localStorage sync errors
          }
        }
        toast.success('Tải ảnh lên thành công');
      } else {
        toast.error('Tải ảnh thất bại');
      }
    } catch (e) {
      handleError(e, 'Tải ảnh thất bại');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập');
      navigate('/auth?mode=login');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: userInfo.name || `${userInfo.firstName} ${userInfo.lastName}`.trim(),
        firstName: userInfo.firstName || undefined,
        lastName: userInfo.lastName || undefined,
        phone: userInfo.phone || undefined,
        avatar: userInfo.avatar || undefined,
        dateOfBirth: userInfo.dateOfBirth || undefined,
        gender: userInfo.gender,
        address:
          userInfo.addressStreet || userInfo.city || userInfo.postalCode || userInfo.country
            ? {
                street: userInfo.addressStreet || undefined,
                city: userInfo.city || undefined,
                postalCode: userInfo.postalCode || undefined,
                country: userInfo.country || undefined,
              }
            : undefined,
      };
      const res = await apiClient.patch(`/auth/me`, payload);
      const u = res.data || {};
      setUserInfo((prev) => ({
        ...prev,
        name: u.name || prev.name,
        firstName: u.firstName || prev.firstName,
        lastName: u.lastName || prev.lastName,
        email: u.email || prev.email,
        phone: u.phone || '',
        avatar: u.avatar || prev.avatar,
        dateOfBirth: u.dateOfBirth ? String(u.dateOfBirth).slice(0, 10) : '',
        gender: u.gender || 'other',
        addressStreet: u.address?.street || prev.addressStreet,
        city: u.address?.city || prev.city,
        postalCode: u.address?.postalCode || prev.postalCode,
        country: u.address?.country || prev.country,
      }));

      setTimeout(() => {
        syncAuth();
      }, 0);

      setIsEditing(false);
      toast.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      handleError(error, 'Cập nhật hồ sơ thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setPwSubmitting(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
    } catch (err) {
      handleError(err, 'Đổi mật khẩu thất bại');
    } finally {
      setPwSubmitting(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Thông tin cá nhân', icon: '👤' },
    { id: 'orders', name: 'Đơn hàng', icon: '📦' },
    { id: 'wishlist', name: 'Yêu thích', icon: '❤️' },
    { id: 'settings', name: 'Cài đặt', icon: '⚙️' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-[rgb(var(--color-primary-50))] text-[rgb(var(--color-primary-600))]';
      case 'processing':
        return 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]';
      case 'shipped':
        return 'bg-[rgb(var(--color-info))]/10 text-[rgb(var(--color-info))]';
      case 'delivered':
        return 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]';
      case 'cancelled':
        return 'bg-[rgb(var(--color-error))]/10 text-[rgb(var(--color-error))]';
      case 'refunded':
        return 'bg-[rgb(var(--color-primary-100))] text-[rgb(var(--color-primary-700))]';
      default:
        return 'bg-[rgb(var(--color-bg-alt))] text-[rgb(var(--color-text-muted))]';
    }
  };

  const getStatusText = getOrderStatusText;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--color-text))]">Hồ sơ cá nhân</h1>
          <p className="text-[rgb(var(--color-text-muted))] mt-2">Quản lý thông tin và đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[rgb(var(--color-bg))] rounded-lg shadow p-6 border border-[rgb(var(--color-border))]">
              <div className="text-center mb-6">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <img src={userInfo.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-[rgb(var(--color-bg))/0.7] rounded-full flex items-center justify-center">
                      <Spinner size="sm" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 text-sm border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-bg-alt))]"
                    disabled={uploadingAvatar}
                  >
                    Đổi ảnh
                  </button>
                  {isEditing && (
                    <button
                      onClick={() => setUserInfo((prev) => ({ ...prev, avatar: '/images/Avatar/avt.jpg' }))}
                      className="px-3 py-1 text-sm text-[rgb(var(--color-error))] hover:text-[rgb(var(--color-error)/0.8)]"
                      disabled={uploadingAvatar}
                    >
                      Xóa
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUploadAvatar(e.target.files?.[0])}
                />

                <h3 className="text-lg font-semibold text-[rgb(var(--color-text))] mt-4">
                  {userInfo.name || 'Người dùng'}
                </h3>
                <p className="text-sm text-[rgb(var(--color-text-muted))] break-words">{userInfo.email}</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[rgb(var(--color-primary-50))] text-[rgb(var(--color-primary-700))]'
                        : 'text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-hover-bg))]'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-[rgb(var(--color-bg))] rounded-lg shadow border border-[rgb(var(--color-border))]">
                <div className="px-6 py-4 border-b border-[rgb(var(--color-border))]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Thông tin cá nhân</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-light))] px-4 py-2 rounded-lg hover:bg-[rgb(var(--color-primary-600))] transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                    ) : (
                      <div className="space-x-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] rounded-lg hover:bg-[rgb(var(--color-bg-alt))] transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="bg-[rgb(var(--color-success))] text-[rgb(var(--color-text-light))] px-4 py-2 rounded-lg hover:bg-[rgb(var(--color-success)/0.85)] transition-colors disabled:opacity-50"
                        >
                          {loading ? <Spinner size="sm" /> : 'Lưu'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Họ', name: 'firstName', type: 'text' },
                      { label: 'Tên', name: 'lastName', type: 'text' },
                      { label: 'Họ và tên (hiển thị)', name: 'name', type: 'text', colSpan: 2 },
                      { label: 'Email', name: 'email', type: 'email', disabled: true },
                      { label: 'Số điện thoại', name: 'phone', type: 'tel' },
                      { label: 'Ngày sinh', name: 'dateOfBirth', type: 'date' },
                    ].map((field) => (
                      <div key={field.name} className={field.colSpan ? `md:col-span-${field.colSpan}` : ''}>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={userInfo[field.name]}
                          onChange={handleInputChange}
                          disabled={field.disabled || !isEditing}
                          className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] disabled:bg-[rgb(var(--color-bg-alt))] disabled:text-[rgb(var(--color-text-muted))]"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Giới tính</label>
                      <select
                        name="gender"
                        value={userInfo.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] disabled:bg-[rgb(var(--color-bg-alt))] disabled:text-[rgb(var(--color-text-muted))]"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: 'Địa chỉ (số nhà, đường)', name: 'addressStreet', colSpan: 2 },
                      { label: 'Thành phố', name: 'city' },
                      { label: 'Mã bưu điện', name: 'postalCode' },
                    ].map((field) => (
                      <div key={field.name} className={field.colSpan ? `md:col-span-${field.colSpan}` : ''}>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          name={field.name}
                          value={userInfo[field.name]}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] disabled:bg-[rgb(var(--color-bg-alt))] disabled:text-[rgb(var(--color-text-muted))]"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-2">Quốc gia</label>
                      <select
                        name="country"
                        value={userInfo.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] disabled:bg-[rgb(var(--color-bg-alt))] disabled:text-[rgb(var(--color-text-muted))]"
                      >
                        <option value="Vietnam">Việt Nam</option>
                        <option value="USA">Hoa Kỳ</option>
                        <option value="UK">Anh</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-[rgb(var(--color-bg))] rounded-lg shadow border border-[rgb(var(--color-border))]">
                <div className="px-6 py-4 border-b border-[rgb(var(--color-border))]">
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Đơn hàng của tôi</h2>
                </div>

                <div className="p-6">
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner size="lg" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-[rgb(var(--color-text-muted))] text-sm">Chưa có đơn hàng nào</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[rgb(var(--color-border))]">
                        <thead className="bg-[rgb(var(--color-bg-alt))]">
                          <tr>
                            {['Mã đơn', 'Ngày đặt', 'Số SP', 'Tổng tiền', 'Trạng thái'].map((header) => (
                              <th
                                key={header}
                                className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-[rgb(var(--color-bg))] divide-y divide-[rgb(var(--color-border))]">
                          {orders.map((o) => (
                            <tr key={o._id} className="hover:bg-[rgb(var(--color-bg-alt))]">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[rgb(var(--color-text))]">
                                #{o._id.slice(-6)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text))]">
                                {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text))]">
                                {o.items?.length || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text))]">
                                {formatVnd(o.total)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(o.status)}`}
                                >
                                  {getStatusText(o.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-[rgb(var(--color-bg))] rounded-lg shadow border border-[rgb(var(--color-border))]">
                <div className="px-6 py-4 border-b border-[rgb(var(--color-border))]">
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Danh sách yêu thích</h2>
                </div>

                <div className="p-6">
                  <div className="text-center py-12">
                    <div className="text-[rgb(var(--color-text-muted))] text-6xl mb-4">❤️</div>
                    <h3 className="text-lg font-medium text-[rgb(var(--color-text))] mb-2">
                      Danh sách yêu thích trống
                    </h3>
                    <p className="text-[rgb(var(--color-text-light))] mb-6">
                      Bạn chưa có sản phẩm nào trong danh sách yêu thích
                    </p>
                    <Link
                      to="/shop"
                      className="bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-light))] px-6 py-3 rounded-lg hover:bg-[rgb(var(--color-primary-600))] transition-colors"
                    >
                      Khám phá sản phẩm
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-[rgb(var(--color-bg))] rounded-lg shadow border border-[rgb(var(--color-border))]">
                <div className="px-6 py-4 border-b border-[rgb(var(--color-border))]">
                  <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">Cài đặt</h2>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-[rgb(var(--color-text))] mb-4">Bảo mật</h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => setShowChangePassword(true)}
                        className="w-full text-left p-4 border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-bg-alt))] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-medium text-[rgb(var(--color-text))]">Đổi mật khẩu</h4>
                            <p className="text-sm text-[rgb(var(--color-text-light))]">Cập nhật mật khẩu của bạn</p>
                          </div>
                        </div>
                      </button>

                      <button className="w-full text-left p-4 border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-bg-alt))] transition-colors">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-medium text-[rgb(var(--color-text))]">Xác thực 2 bước</h4>
                            <p className="text-sm text-[rgb(var(--color-text-light))]">Bảo mật tài khoản với 2FA</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[rgb(var(--color-text))] mb-4">Thông báo</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))] border-[rgb(var(--color-border))] rounded"
                        />
                        <div>
                          <h4 className="font-medium text-[rgb(var(--color-text))]">Email thông báo</h4>
                          <p className="text-sm text-[rgb(var(--color-text-light))]">Nhận thông báo qua email</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))] border-[rgb(var(--color-border))] rounded"
                        />
                        <div>
                          <h4 className="font-medium text-[rgb(var(--color-text))]">SMS thông báo</h4>
                          <p className="text-sm text-[rgb(var(--color-text-light))]">Nhận thông báo qua SMS</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[rgb(var(--color-text))] mb-4">Tài khoản</h3>
                    <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-[rgb(var(--color-error))]">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-medium">Xóa tài khoản</h4>
                          <p className="text-sm text-[rgb(var(--color-error))]">Xóa vĩnh viễn tài khoản của bạn</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showChangePassword && (
        <div className="fixed inset-0 bg-[rgb(var(--color-overlay))] overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-20">
          <div className="relative w-11/12 md:w-1/2 lg:w-1/3 p-6 border shadow-lg rounded-md bg-[rgb(var(--color-bg))]">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Đổi mật khẩu</h3>
              <p className="text-sm text-[rgb(var(--color-text-light))]">
                Vui lòng nhập mật khẩu hiện tại và mật khẩu mới
              </p>
            </div>
            <form onSubmit={handleSubmitChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text))] mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] rounded-lg hover:bg-[rgb(var(--color-bg-alt))]"
                  disabled={pwSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={pwSubmitting}
                  className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-light))] rounded-lg hover:bg-[rgb(var(--color-primary-700))] disabled:opacity-50"
                >
                  {pwSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
