
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import AuthContainer from '@/components/auth/AuthContainer';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/contexts/toast';

const Auth = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user just landed on this page after being redirected from a protected route
    const redirectReason = new URLSearchParams(window.location.search).get('reason');
    if (redirectReason === 'protected') {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page",
        variant: "destructive",
      });
    }
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If already logged in, redirect to dashboard
  if (session) {
    console.log("User is already authenticated, redirecting to dashboard");
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
