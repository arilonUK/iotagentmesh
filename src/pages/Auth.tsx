
import React from 'react';
import AuthContainer from '@/components/auth/AuthContainer';

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your IoT dashboard
          </p>
        </div>
        <AuthContainer />
      </div>
    </div>
  );
};

export default Auth;
