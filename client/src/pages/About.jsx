import React from 'react';
import { Target, Users, Heart, Store } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Về KATO</h1>
          <p className="text-xl text-gray-600">Câu chuyện, sứ mệnh và đội ngũ của chúng tôi.</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-gray-700 space-y-10">
          <div className="flex flex-col md:flex-row items-center md:space-x-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Câu Chuyện Của KATO</h2>
              <p className="mb-4">
                KATO được thành lập từ niềm đam mê mãnh liệt với thời trang và mong muốn tạo ra một không gian mua sắm
                trực tuyến, nơi mọi người có thể dễ dàng tìm thấy những sản phẩm không chỉ đẹp về mẫu mã mà còn vượt
                trội về chất lượng. Chúng tôi tin rằng trang phục không chỉ là để mặc, mà còn là cách để thể hiện cá
                tính và câu chuyện của mỗi người.
              </p>
              <p>
                Bắt đầu từ một cửa hàng nhỏ, với sự nỗ lực không ngừng và sự tin yêu của khách hàng, KATO đã dần khẳng
                định vị thế của mình, trở thành điểm đến tin cậy cho những tín đồ thời trang trên khắp cả nước.
              </p>
            </div>
            <div className="md:w-1/2 mt-6 md:mt-0">
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1887&auto=format&fit=crop"
                alt="Kato Store Fashion"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-8 border-t">
            <div className="flex flex-col items-center">
              <Target className="w-12 h-12 text-[rgb(var(--color-primary))] mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Sứ Mệnh</h3>
              <p className="text-gray-600 mt-2">
                Mang đến sản phẩm thời trang chất lượng, hợp xu hướng với giá cả phải chăng, giúp mọi người tự tin thể
                hiện phong cách.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="w-12 h-12 text-[rgb(var(--color-primary))] mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Giá Trị Cốt Lõi</h3>
              <p className="text-gray-600 mt-2">
                Chất lượng, Sáng tạo và Sự hài lòng của khách hàng là kim chỉ nam cho mọi hoạt động của chúng tôi.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-12 h-12 text-[rgb(var(--color-primary))] mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Đội Ngũ</h3>
              <p className="text-gray-600 mt-2">
                Chúng tôi là một tập thể trẻ trung, năng động và đầy nhiệt huyết, luôn sẵn sàng lắng nghe và phục vụ
                bạn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
