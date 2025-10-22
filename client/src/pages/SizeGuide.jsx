import React from 'react';
import { Ruler } from 'lucide-react';

const SizeGuide = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Hướng Dẫn Chọn Size</h1>
          <p className="text-xl text-gray-600">Tìm kích thước hoàn hảo cho bạn.</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 space-y-10">
          {/* Hướng dẫn đo */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Ruler className="mr-3 text-[rgb(var(--color-primary))]" />
              Cách lấy số đo cơ thể
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-800">1. Vòng ngực</h3>
                <p>Dùng thước dây đo quanh vòng ngực lớn nhất của bạn.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">2. Vòng eo</h3>
                <p>Đo quanh phần eo nhỏ nhất của bạn.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">3. Vòng hông</h3>
                <p>Đứng khép chân và đo quanh phần hông lớn nhất.</p>
              </div>
            </div>
          </div>

          {/* Bảng size chung */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Bảng size chung (Tham khảo)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chiều cao (cm)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cân nặng (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vòng ngực (cm)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vòng eo (cm)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">S</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">155 - 165</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">45 - 55</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">82 - 86</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">66 - 70</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">M</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">165 - 175</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">55 - 65</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">87 - 91</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">71 - 75</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">L</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">175 - 180</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">65 - 75</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">92 - 96</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">76 - 80</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">XL</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">180+</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">75+</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">97 - 102</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">81 - 86</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Lưu ý */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Lưu ý quan trọng:</h3>
            <ul className="list-disc list-inside space-y-2 mt-2 text-gray-600">
              <li>
                Bảng size trên chỉ mang tính chất tham khảo. Tùy thuộc vào chất liệu và kiểu dáng (form regular, slim
                fit, oversized) mà thông số có thể chênh lệch.
              </li>
              <li>Nếu số đo của bạn nằm giữa hai size, hãy chọn size lớn hơn để cảm thấy thoải mái hơn khi mặc.</li>
              <li>Đừng ngần ngại liên hệ với đội ngũ tư vấn của KATO để được hỗ trợ chọn size chính xác nhất!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
