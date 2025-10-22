import React from 'react';
import { CheckCircle, XCircle, RefreshCw, Box, CreditCard } from 'lucide-react';

const Returns = () => {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-alt))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chính Sách Đổi Trả & Hoàn Tiền</h1>
          <p className="text-xl text-gray-600">Thông tin về việc đổi trả sản phẩm.</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-gray-700 space-y-10">
          {/* Điều kiện đổi trả */}
          <div className="flex items-start space-x-4">
            <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">1. Điều Kiện Áp Dụng Đổi Trả</h2>
              <p className="mb-3">
                KatoStore hỗ trợ đổi/trả sản phẩm trong vòng <strong>07 ngày</strong> kể từ ngày khách hàng nhận được
                hàng.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Sản phẩm phải còn mới 100%, chưa qua sử dụng, chưa giặt ủi.</li>
                <li>Sản phẩm phải còn nguyên tem, mác, và bao bì gốc.</li>
                <li>Sản phẩm bị lỗi do nhà sản xuất (lỗi chỉ, rách, phai màu...).</li>
                <li>Sản phẩm giao không đúng mẫu mã, size, màu sắc so với đơn hàng đã đặt.</li>
                <li>Sản phẩm đổi phải có giá trị bằng hoặc cao hơn sản phẩm đã mua.</li>
              </ul>
            </div>
          </div>

          {/* Sản phẩm không áp dụng */}
          <div className="flex items-start space-x-4">
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">2. Sản Phẩm Không Áp Dụng Đổi Trả</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Sản phẩm đã qua sử dụng, giặt ủi, hoặc có mùi lạ.</li>
                <li>Sản phẩm không còn tem, mác, hoặc bao bì.</li>
                <li>Sản phẩm trong các chương trình giảm giá, khuyến mãi, thanh lý.</li>
                <li>Đồ lót, phụ kiện (tất, mũ, trang sức...).</li>
                <li>Sản phẩm bị hư hỏng do lỗi từ phía khách hàng (làm rách, dính bẩn...).</li>
              </ul>
            </div>
          </div>

          {/* Quy trình đổi trả */}
          <div className="flex items-start space-x-4">
            <RefreshCw className="w-8 h-8 text-[rgb(var(--color-primary))] flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">3. Quy Trình Đổi Trả</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong>Bước 1: Liên hệ KatoStore</strong>
                  <p className="pl-4 text-sm">
                    Vui lòng liên hệ với chúng tôi qua Fanpage hoặc Hotline trong vòng 07 ngày kể từ khi nhận hàng để
                    thông báo về yêu cầu đổi/trả. Cung cấp mã đơn hàng và video/hình ảnh về tình trạng sản phẩm.
                  </p>
                </li>
                <li>
                  <strong>Bước 2: Đóng gói sản phẩm</strong>
                  <p className="pl-4 text-sm">
                    Sau khi yêu cầu được xác nhận, vui lòng đóng gói sản phẩm cẩn thận, bao gồm đầy đủ phụ kiện, tem
                    mác, quà tặng (nếu có).
                  </p>
                </li>
                <li>
                  <strong>Bước 3: Gửi hàng về cho KatoStore</strong>
                  <p className="pl-4 text-sm">
                    Gửi sản phẩm về địa chỉ do nhân viên hỗ trợ của chúng tôi cung cấp. Khách hàng vui lòng thanh toán
                    trước phí vận chuyển. KatoStore sẽ hỗ trợ phí vận chuyển 2 chiều nếu lỗi thuộc về nhà sản xuất hoặc
                    do shop giao sai hàng.
                  </p>
                </li>
              </ol>
            </div>
          </div>

          {/* Hoàn tiền */}
          <div className="flex items-start space-x-4">
            <CreditCard className="w-8 h-8 text-[rgb(var(--color-primary))] flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">4. Chính Sách Hoàn Tiền</h2>
              <p>
                KatoStore sẽ tiến hành hoàn tiền cho khách hàng trong vòng <strong>3-5 ngày</strong> làm việc sau khi
                nhận được sản phẩm trả lại và xác nhận đủ điều kiện. Tiền sẽ được hoàn qua hình thức chuyển khoản ngân
                hàng theo thông tin do khách hàng cung cấp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;
