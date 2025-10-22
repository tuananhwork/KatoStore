import React from 'react';
import { Truck, Clock, MapPin, PackageSearch, ShieldCheck } from 'lucide-react';

const Shipping = () => {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-alt))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chính Sách Vận Chuyển</h1>
          <p className="text-xl text-gray-600">Thông tin chi tiết về việc giao hàng của chúng tôi.</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-gray-700 space-y-10">
          {/* Thời gian xử lý đơn hàng */}
          <div className="flex items-start space-x-4">
            <Clock className="w-8 h-8 text-[rgb(var(--color-primary))] flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">1. Thời Gian Xử Lý Đơn Hàng</h2>
              <p>
                Tất cả các đơn hàng sẽ được xử lý và chuẩn bị trong vòng <strong>24 giờ</strong> làm việc (không bao gồm
                Thứ 7, Chủ Nhật và các ngày lễ) sau khi nhận được email xác nhận đơn hàng. Bạn sẽ nhận được một thông
                báo khác khi đơn hàng của bạn đã được vận chuyển.
              </p>
            </div>
          </div>

          {/* Đối tác vận chuyển */}
          <div className="flex items-start space-x-4">
            <Truck className="w-8 h-8 text-[rgb(var(--color-primary))] flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">2. Đối Tác và Thời Gian Giao Hàng</h2>
              <p className="mb-3">
                KatoStore hợp tác với các đơn vị vận chuyển uy tín như Giao Hàng Nhanh (GHN), Giao Hàng Tiết Kiệm
                (GHTK), Viettel Post để đảm bảo đơn hàng đến tay bạn nhanh chóng và an toàn.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Nội thành TP.HCM và Hà Nội:</strong> 1-2 ngày làm việc.
                </li>
                <li>
                  <strong>Các tỉnh thành khác:</strong> 3-5 ngày làm việc.
                </li>
              </ul>
              <p className="mt-3 text-sm text-gray-500">
                Lưu ý: Thời gian giao hàng có thể kéo dài hơn dự kiến do các yếu tố bất khả kháng như thời tiết, tình
                hình giao thông, hoặc trong các đợt khuyến mãi lớn.
              </p>
            </div>
          </div>

          {/* Phí vận chuyển */}
          <div className="flex items-start space-x-4">
            <MapPin className="w-8 h-8 text-[rgb(var(--color-primary))] flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">3. Phí Vận Chuyển</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Đồng giá 25.000 VNĐ</strong> cho tất cả các đơn hàng nội thành TP.HCM và Hà Nội.
                </li>
                <li>
                  <strong>Đồng giá 35.000 VNĐ</strong> cho các tỉnh thành khác.
                </li>
                <li>
                  <strong>Miễn phí vận chuyển (Freeship)</strong> cho đơn hàng có giá trị từ{' '}
                  <strong>500.000 VNĐ</strong> trở lên.
                </li>
              </ul>
              <p className="mt-3">Phí vận chuyển cuối cùng sẽ được hiển thị rõ ràng tại trang thanh toán.</p>
            </div>
          </div>

          {/* Theo dõi đơn hàng */}
          <div className="flex items-start space-x-4">
            <PackageSearch className="w-8 h-8 text-[rgb(var(--color-primary))] flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">4. Theo Dõi Đơn Hàng</h2>
              <p>
                Khi đơn hàng được chuyển đi, bạn sẽ nhận được email thông báo kèm theo <strong>mã vận đơn</strong>. Bạn
                có thể sử dụng mã này để theo dõi hành trình đơn hàng trực tiếp trên website của đối tác vận chuyển.
              </p>
            </div>
          </div>

          {/* Kiểm tra hàng */}
          <div className="flex items-start space-x-4">
            <ShieldCheck className="w-8 h-8 text-[rgb(var(--color-primary))] flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">5. Kiểm Tra Hàng Khi Nhận (Đồng Kiểm)</h2>
              <p>
                Để đảm bảo quyền lợi, KatoStore khuyến khích khách hàng quay video quá trình mở gói hàng và kiểm tra sản
                phẩm. Vui lòng kiểm tra kỹ lưỡng về số lượng, mẫu mã, màu sắc, và tình trạng sản phẩm. Nếu phát hiện bất
                kỳ sai sót nào, vui lòng từ chối nhận hàng và liên hệ ngay với chúng tôi qua hotline để được hỗ trợ kịp
                thời.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
