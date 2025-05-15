
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import AuthContainer from '@/components/auth/AuthContainer';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // If user just landed on this page after being redirected from a protected route
    const redirectReason = new URLSearchParams(window.location.search).get('reason');
    if (redirectReason === 'protected') {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page"
      });
    }
  }, [toast]);

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
    // Get the redirect path from location state, or default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
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
