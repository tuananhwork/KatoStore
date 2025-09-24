import { Facebook, Instagram, Linkedin } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-[rgb(var(--color-primary))]">KatoStore</div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Cửa hàng trực tuyến hàng đầu với đa dạng sản phẩm chất lượng cao, giá cả hợp lý và dịch vụ khách hàng tận
              tâm.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[rgb(var(--color-primary))] transition-colors">
                <Facebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-[rgb(var(--color-primary))] transition-colors">
                <Instagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-[rgb(var(--color-primary))] transition-colors">
                <Linkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[rgb(var(--color-primary))] transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-[rgb(var(--color-primary))] transition-colors">
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-[rgb(var(--color-primary))] transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-[rgb(var(--color-primary))] transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-[rgb(var(--color-primary))] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-300 hover:text-[rgb(var(--color-primary))] transition-colors">
                  Trợ giúp
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-[rgb(var(--color-primary))] transition-colors">
                  Vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-[rgb(var(--color-primary))] transition-colors">
                  Đổi trả
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-[rgb(var(--color-primary))] transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  to="/size-guide"
                  className="text-gray-300 hover:text-[rgb(var(--color-primary))] transition-colors"
                >
                  Hướng dẫn chọn size
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-[rgb(var(--color-primary))] mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="text-sm text-gray-300">
                  <p>123 Đường ABC, Quận XYZ</p>
                  <p>TP. Hồ Chí Minh, Việt Nam</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-[rgb(var(--color-primary))]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-sm text-gray-300">+84 123 456 789</span>
              </div>

              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-[rgb(var(--color-primary))]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-gray-300">contact@katostore.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">© 2025 KatoStore. Tất cả quyền được bảo lưu.</div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/privacy"
                className="text-sm text-gray-400 hover:text-[rgb(var(--color-primary))] transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-400 hover:text-[rgb(var(--color-primary))] transition-colors"
              >
                Điều khoản sử dụng
              </Link>
              <Link
                to="/cookies"
                className="text-sm text-gray-400 hover:text-[rgb(var(--color-primary))] transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
