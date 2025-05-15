
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

export default function App() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  
  // Set up a global session listener to prevent route access issues
  useEffect(() => {
    if (!loading && !session && window.location.pathname.startsWith('/dashboard')) {
      console.log("No authenticated session detected for protected route, redirecting to auth");
      navigate('/auth', { replace: true });
    }
  }, [session, loading, navigate]);
  
  return <Outlet />;
}
