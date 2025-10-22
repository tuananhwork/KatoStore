import React from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Trung tâm trợ giúp</h1>
          <p className="text-xl text-gray-600">Chúng tôi có thể giúp gì cho bạn?</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-gray-700 space-y-4">
          <p>
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng tham khảo trang{' '}
            <Link to="/faq" className="text-[rgb(var(--color-primary))] hover:underline">
              Câu hỏi thường gặp
            </Link>{' '}
            hoặc{' '}
            <Link to="/contact" className="text-[rgb(var(--color-primary))] hover:underline">
              liên hệ trực tiếp
            </Link>{' '}
            với chúng tôi để được hỗ trợ nhanh nhất.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;
