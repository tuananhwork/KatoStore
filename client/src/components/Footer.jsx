import { Facebook, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[rgb(var(--color-bg-dark))] text-[rgb(var(--color-text))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-[rgb(var(--color-primary))]">KatoStore</div>
            <p className="text-[rgb(var(--color-text)/0.7)] text-sm leading-relaxed">
              Cửa hàng trực tuyến hàng đầu với đa dạng sản phẩm chất lượng cao, giá cả hợp lý và dịch vụ khách hàng tận
              tâm.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-[rgb(var(--color-text)/0.6)] hover:text-[rgb(var(--color-primary))] transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[rgb(var(--color-text)/0.6)] hover:text-[rgb(var(--color-primary))] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-[rgb(var(--color-text)/0.6)] hover:text-[rgb(var(--color-primary))] transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Liên kết nhanh</h3>
            <ul className="space-y-2">
              {[
                { path: '/', label: 'Trang chủ' },
                { path: '/shop', label: 'Cửa hàng' },
                { path: '/about', label: 'Về chúng tôi' },
                { path: '/contact', label: 'Liên hệ' },
                { path: '/blog', label: 'Blog' },
              ].map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-[rgb(var(--color-text)/0.7)] hover:text-[rgb(var(--color-primary))] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2">
              {[
                { path: '/help', label: 'Trợ giúp' },
                { path: '/shipping', label: 'Vận chuyển' },
                { path: '/returns', label: 'Đổi trả' },
                { path: '/faq', label: 'Câu hỏi thường gặp' },
                { path: '/size-guide', label: 'Hướng dẫn chọn size' },
              ].map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-[rgb(var(--color-text)/0.7)] hover:text-[rgb(var(--color-primary))] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[rgb(var(--color-primary))] mt-0.5" />
                <div className="text-sm text-[rgb(var(--color-text)/0.7)]">
                  <p>123 Đường ABC, Quận XYZ</p>
                  <p>TP. Hồ Chí Minh, Việt Nam</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                <span className="text-sm text-[rgb(var(--color-text)/0.7)]">+84 123 456 789</span>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                <span className="text-sm text-[rgb(var(--color-text)/0.7)]">contact@katostore.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-[rgb(var(--color-border))] mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-[rgb(var(--color-text)/0.6)]">
              © 2025 KatoStore. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {[
                { path: '/privacy', label: 'Chính sách bảo mật' },
                { path: '/terms', label: 'Điều khoản sử dụng' },
                { path: '/cookies', label: 'Cookie Policy' },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className="text-sm text-[rgb(var(--color-text)/0.6)] hover:text-[rgb(var(--color-primary))] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
