import React, { useState } from 'react';
import authAPI, { login as loginAPI } from '../api/authAPI';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth.jsx';
import { handleError } from '../utils/toast';

const LoginForm = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { syncAuth } = useAuth();

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter OTP & new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginAPI({
        email: formData.email,
        password: formData.password,
        remember: !!formData.remember,
      });
      if (data?.accessToken) {
        // Persist token/user depending on remember
        if (formData.remember) {
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('token', data.accessToken);
          sessionStorage.setItem('user', JSON.stringify(data.user));
          // Also clear any stale localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        // Immediately sync auth context in the same tab
        syncAuth();
        toast.success('Đăng nhập thành công');
        navigate('/');
        return;
      }
      toast.error('Đăng nhập thất bại');
    } catch (err) {
      handleError(err, 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Vui lòng nhập email');
      return;
    }
    setForgotSubmitting(true);
    try {
      await authAPI.forgotPassword(forgotEmail);
      toast.success('Đã gửi mã OTP tới email (nếu tồn tại)');
      setForgotStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gửi OTP thất bại';
      toast.error(msg);
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleResetWithOTP = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Vui lòng nhập OTP và mật khẩu mới');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Xác nhận mật khẩu không khớp');
      return;
    }
    setForgotSubmitting(true);
    try {
      await authAPI.resetPasswordWithOTP({ email: forgotEmail, otp, newPassword });
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập.');
      setShowForgot(false);
      setForgotStep(1);
      setOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setForgotEmail('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Đặt lại mật khẩu thất bại';
      toast.error(msg);
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--color-text-light))]">
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400
                 focus:outline-none focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] sm:text-sm"
              placeholder="Nhập email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--color-text-light))]">
            Mật khẩu
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400
                 focus:outline-none focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] sm:text-sm"
              placeholder="Nhập mật khẩu"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={formData.remember}
              onChange={handleChange}
              className="h-4 w-4 text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))] border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-[rgb(var(--color-text))]">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <div className="text-sm">
            <button type="button" onClick={() => setShowForgot(true)} className="font-medium link-primary">
              Quên mật khẩu?
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg
               text-[rgb(var(--color-text-light))] bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-600))]
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--color-primary))]
               disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[rgb(var(--color-text-light))]">Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-[rgb(var(--color-text-light))] hover:bg-pink-50">
            <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
            <span className="ml-2">Google</span>
          </button>

          <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-[rgb(var(--color-text-light))] hover:bg-pink-50">
            <img src="/icons/facebook.svg" alt="Facebook" className="w-5 h-5" />
            <span className="ml-2">Facebook</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-[rgb(var(--color-text-light))]">
        Chưa có tài khoản?{' '}
        <button onClick={onSwitch} className="font-medium link-primary">
          Đăng ký ngay
        </button>
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Quên mật khẩu</h3>
              <p className="text-sm text-[rgb(var(--color-text-light))]">
                {forgotStep === 1
                  ? 'Nhập email để nhận mã OTP đặt lại mật khẩu'
                  : 'Nhập mã OTP và mật khẩu mới để đặt lại'}
              </p>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-1">Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="px-4 py-2 border border-gray-300 text-[rgb(var(--color-text-light))] rounded-lg hover:bg-gray-50"
                    disabled={forgotSubmitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="px-4 py-2 bg-pink-600 text-[rgb(var(--color-text-light))] rounded-lg hover:bg-pink-700 disabled:opacity-50"
                  >
                    {forgotSubmitting ? 'Đang gửi...' : 'Gửi OTP'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetWithOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-1">Mã OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-light))] mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-sm text-[rgb(var(--color-text-light))] hover:underline"
                    disabled={forgotSubmitting}
                  >
                    Quay lại
                  </button>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className="px-4 py-2 border border-gray-300 text-[rgb(var(--color-text-light))] rounded-lg hover:bg-gray-50"
                      disabled={forgotSubmitting}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={forgotSubmitting}
                      className="px-4 py-2 bg-pink-600 text-[rgb(var(--color-text-light))] rounded-lg hover:bg-pink-700 disabled:opacity-50"
                    >
                      {forgotSubmitting ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
