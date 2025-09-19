import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoginForm from '../components/LoginForm.jsx';
import RegisterForm from '../components/RegisterForm.jsx';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [isLogin, setIsLogin] = useState(mode === 'login');

  const handleSwitch = () => setIsLogin((prev) => !prev);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">KatoStore</h2>
          <h3 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </h3>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {isLogin ? (
          <LoginForm onSwitch={handleSwitch} />
        ) : (
          <RegisterForm onSwitch={handleSwitch} />
        )}
      </div>
    </div>
  );
};

export default Auth;
