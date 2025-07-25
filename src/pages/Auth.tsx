
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import AuthContainer from '@/components/auth/AuthContainer';

const Auth = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Auth page: checking auth state', { isAuthenticated, loading });
    
    // Only redirect if user is authenticated and not loading
    if (isAuthenticated && !loading) {
      console.log('Auth page: User already authenticated, redirecting to dashboard');
      
      // Get the original destination from location state, default to dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      console.log('Auth page: Redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location]);

  // Show loading only while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show auth form for unauthenticated users
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
