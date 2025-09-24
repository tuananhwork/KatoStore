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
        return 'bg-pink-100 text-pink-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin và đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <img src={userInfo.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                      <Spinner size="sm" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={uploadingAvatar}
                  >
                    Đổi ảnh
                  </button>
                  {isEditing && (
                    <button
                      onClick={() => setUserInfo((prev) => ({ ...prev, avatar: '/images/Avatar/avt.jpg' }))}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
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

                <h3 className="text-lg font-semibold text-gray-900 mt-4">{userInfo.name || 'Người dùng'}</h3>
                <p className="text-sm text-gray-500 break-words">{userInfo.email}</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-pink-50 text-[rgb(var(--color-primary))]'
                        : 'text-gray-600 hover:bg-gray-50'
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
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                    ) : (
                      <div className="space-x-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? <Spinner size="sm" /> : 'Lưu'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ</label>
                      <input
                        type="text"
                        name="firstName"
                        value={userInfo.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                      <input
                        type="text"
                        name="lastName"
                        value={userInfo.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên (hiển thị)</label>
                      <input
                        type="text"
                        name="name"
                        value={userInfo.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={userInfo.email}
                        onChange={handleInputChange}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={userInfo.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={userInfo.dateOfBirth}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                      <select
                        name="gender"
                        value={userInfo.gender}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ (số nhà, đường)</label>
                      <input
                        type="text"
                        name="addressStreet"
                        value={userInfo.addressStreet}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                      <input
                        type="text"
                        name="city"
                        value={userInfo.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mã bưu điện</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={userInfo.postalCode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia</label>
                      <select
                        name="country"
                        value={userInfo.country}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
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
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Đơn hàng của tôi</h2>
                </div>

                <div className="p-6">
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner size="lg" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-gray-500 text-sm">Chưa có đơn hàng nào</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mã đơn
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày đặt
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Số SP
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tổng tiền
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((o) => (
                            <tr key={o._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{o._id.slice(-6)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {o.items?.length || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
              <div className="bg_white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Danh sách yêu thích</h2>
                </div>

                <div className="p-6">
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">❤️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Danh sách yêu thích trống</h3>
                    <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong danh sách yêu thích</p>
                    <Link
                      to="/shop"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Khám phá sản phẩm
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Cài đặt</h2>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Bảo mật</h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => setShowChangePassword(true)}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify_between">
                          <div>
                            <h4 className="font-medium text-gray-900">Đổi mật khẩu</h4>
                            <p className="text-sm text-gray-500">Cập nhật mật khẩu của bạn</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>

                      <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify_between">
                          <div>
                            <h4 className="font-medium text-gray-900">Xác thực 2 bước</h4>
                            <p className="text-sm text-gray-500">Bảo mật tài khoản với 2FA</p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thông báo</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify_between">
                        <div>
                          <h4 className="font-medium text-gray-900">Email thông báo</h4>
                          <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify_between">
                        <div>
                          <h4 className="font-medium text-gray-900">SMS thông báo</h4>
                          <p className="text-sm text-gray-500">Nhận thông báo qua SMS</p>
                        </div>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tài khoản</h3>
                    <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                      <div className="flex items-center justify_between">
                        <div>
                          <h4 className="font-medium">Xóa tài khoản</h4>
                          <p className="text-sm">Xóa vĩnh viễn tài khoản của bạn</p>
                        </div>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
              <p className="text-sm text-gray-500">Vui lòng nhập mật khẩu hiện tại và mật khẩu mới</p>
            </div>
            <form onSubmit={handleSubmitChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={pwSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={pwSubmitting}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
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
