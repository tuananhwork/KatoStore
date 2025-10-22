import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FaqItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="py-6 border-b border-gray-200">
      <dt className="text-lg">
        <button
          onClick={onClick}
          className="text-left w-full flex justify-between items-start text-gray-500 focus:outline-none"
        >
          <span className="font-medium text-gray-900">{question}</span>
          <span className="ml-6 h-7 flex items-center">
            <ChevronDown
              className={`transform transition-transform duration-300 ${isOpen ? '-rotate-180' : 'rotate-0'}`}
              size={24}
            />
          </span>
        </button>
      </dt>
      {isOpen && (
        <dd className="mt-2 pr-12">
          <p className="text-base text-gray-600">{answer}</p>
        </dd>
      )}
    </div>
  );
};

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      category: 'Đặt hàng & Thanh toán',
      question: 'Làm thế nào để đặt hàng?',
      answer:
        'Bạn chỉ cần chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán. Điền đầy đủ thông tin và chúng tôi sẽ giao hàng cho bạn.',
    },
    {
      category: 'Đặt hàng & Thanh toán',
      question: 'KatoStore chấp nhận những hình thức thanh toán nào?',
      answer:
        'Chúng tôi chấp nhận thanh toán khi nhận hàng (COD) và thanh toán trực tuyến qua cổng VNPAY (Thẻ ATM, Visa, Mastercard, QR Code).',
    },
    {
      category: 'Vận chuyển',
      question: 'Mất bao lâu để nhận được hàng?',
      answer:
        'Thời gian giao hàng dự kiến từ 1-2 ngày cho khu vực nội thành và 3-5 ngày cho các tỉnh thành khác, không tính cuối tuần và ngày lễ.',
    },
    {
      category: 'Vận chuyển',
      question: 'Làm thế nào để theo dõi đơn hàng của tôi?',
      answer:
        'Sau khi đơn hàng được gửi đi, bạn sẽ nhận được email chứa mã vận đơn. Bạn có thể dùng mã này để tra cứu trên website của đơn vị vận chuyển.',
    },
    {
      category: 'Đổi trả & Hoàn tiền',
      question: 'Chính sách đổi trả hoạt động như thế nào?',
      answer:
        'Chúng tôi chấp nhận đổi trả trong vòng 7 ngày đối với các sản phẩm còn nguyên tem mác và chưa qua sử dụng. Vui lòng tham khảo trang "Chính sách đổi trả" để biết thêm chi tiết.',
    },
    {
      category: 'Đổi trả & Hoàn tiền',
      question: 'Ai sẽ chịu phí vận chuyển khi đổi trả hàng?',
      answer:
        'KatoStore sẽ chịu phí vận chuyển 2 chiều nếu lỗi do nhà sản xuất hoặc giao sai sản phẩm. Đối với các trường hợp khác (đổi size, đổi mẫu theo ý muốn), khách hàng vui lòng thanh toán phí vận chuyển.',
    },
  ];

  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-alt))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Câu hỏi thường gặp (FAQ)</h1>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          {Object.keys(groupedFaqs).map((category, catIndex) => (
            <div key={catIndex} className={catIndex > 0 ? 'mt-10' : ''}>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{category}</h2>
              <dl className="divide-y divide-gray-200">
                {groupedFaqs[category].map((faq, index) => (
                  <FaqItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openIndex === `${catIndex}-${index}`}
                    onClick={() => handleToggle(`${catIndex}-${index}`)}
                  />
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
