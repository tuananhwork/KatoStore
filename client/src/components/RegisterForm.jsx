import React, { useState, useEffect } from 'react';
import authAPI from '../api/authAPI';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { handleError } from '../utils/toast';

const RegisterForm = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0); // seconds
  const navigate = useNavigate();

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setInterval(() => setOtpCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [otpCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Vui lòng nhập email');
      return;
    }
    setError('');
    setSendingOTP(true);
    try {
      await authAPI.requestRegisterOTP(formData.email);
      toast.success('Đã gửi mã OTP tới email');
      setOtpCooldown(60); // 60s resend cooldown
    } catch (err) {
      const msg = handleError(err, 'Gửi OTP thất bại');
      setError(msg);
    } finally {
      setSendingOTP(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      const msg = 'Vui lòng nhập đầy đủ Họ và Tên';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      const msg = 'Mật khẩu xác nhận không khớp';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!formData.otp) {
      toast.error('Vui lòng nhập mã OTP');
      return;
    }
    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const data = await authAPI.verifyRegisterOTP({
        name: fullName,
        email: formData.email,
        password: formData.password,
        otp: formData.otp,
      });
      if (data?.accessToken) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Đăng ký thành công');
        navigate('/');
        return;
      }
      toast.error('Xác minh OTP thất bại');
    } catch (err) {
      const msg = handleError(err, 'Xác minh OTP thất bại');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-[rgb(var(--color-text))]">
              Họ
            </label>
            <div className="mt-1">
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md placeholder-[rgb(var(--color-text)/0.5)] focus:outline-none focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] sm:text-sm bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]"
                placeholder="Nhập họ"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-[rgb(var(--color-text))]">
              Tên
            </label>
            <div className="mt-1">
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md placeholder-[rgb(var(--color-text)/0.5)] focus:outline-none focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] sm:text-sm bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]"
                placeholder="Nhập tên"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[rgb(var(--color-text))]">
            Email
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="flex-1 appearance-none block w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md placeholder-[rgb(var(--color-text)/0.5)] focus:outline-none focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] sm:text-sm bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]"
              placeholder="Nhập email"
            />
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={sendingOTP || otpCooldown > 0}
              className="whitespace-nowrap px-3 py-2 rounded-md border border-[rgb(var(--color-border))] text-sm bg-[rgb(var(--color-bg))] hover:bg-[rgb(var(--color-bg-alt))] text-[rgb(var(--color-text))] transition-colors disabled:opacity-50"
            >
              {sendingOTP ? 'Đang gửi...' : otpCooldown > 0 ? `Gửi lại (${otpCooldown}s)` : 'Gửi OTP'}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-[rgb(var(--color-text))]">
            Mã OTP
          </label>
          <div className="mt-1">
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={formData.otp}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md placeholder-[rgb(var(--color-text)/0.5)] focus:outline-none focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] sm:text-sm bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]"
              placeholder="Nhập mã OTP"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[rgb(var(--color-text))]">
            Mật khẩu
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md placeholder-[rgb(var(--color-text)/0.5)] focus:outline-none focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] sm:text-sm bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]"
              placeholder="Nhập mật khẩu"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[rgb(var(--color-text))]">
            Xác nhận mật khẩu
          </label>
          <div className="mt-1">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="appearance-none block w-full px-3 py-2 border border-[rgb(var(--color-border))] rounded-md placeholder-[rgb(var(--color-text)/0.5)] focus:outline-none focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] sm:text-sm bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]"
              placeholder="Nhập lại mật khẩu"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-[rgb(var(--color-text-light))] bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-600))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--color-primary-400))] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Đang xác minh...' : 'Đăng ký'}
          </button>
        </div>
      </form>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-[rgb(var(--color-text-light))]">Hoặc tiếp tục với</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {/* Google Button */}
        <button className="w-full inline-flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-[rgb(var(--color-text-light))] hover:bg-[rgb(var(--color-primary-500))] transition">
          <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
          <span className="ml-2">Google</span>
        </button>

        {/* Facebook Button */}
        <button className="w-full inline-flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-[rgb(var(--color-text-light))] hover:bg-[rgb(var(--color-primary-500))] transition">
          <img src="/icons/facebook.svg" alt="Facebook" className="w-5 h-5" />
          <span className="ml-2">Facebook</span>
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-[rgb(var(--color-text-light))]">
        Đã có tài khoản?{' '}
        <button onClick={onSwitch} className="font-medium link-primary">
          Đăng nhập
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
