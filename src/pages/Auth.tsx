
import React from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/auth';
import AuthContainer from '@/components/auth/AuthContainer';

const Auth = () => {
  const { user } = useAuth();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <AuthContainer />
      </div>
    </div>
  );
};

export default Auth;
