
import React from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import AuthContainer from '@/components/auth/AuthContainer';
import { useAuth } from '@/contexts/auth';

const Auth = () => {
  const { session } = useAuth();

  // If already logged in, redirect to dashboard
  if (session) {
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
