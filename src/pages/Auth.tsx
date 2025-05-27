
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import AuthContainer from '@/components/auth/AuthContainer';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [hasShownMessage, setHasShownMessage] = useState(false);
  
  useEffect(() => {
    // Only show toast once when first landing on auth page
    const redirectReason = new URLSearchParams(window.location.search).get('reason');
    if (redirectReason === 'protected' && !session && !hasShownMessage) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page"
      });
      setHasShownMessage(true);
      
      // Clear the reason parameter to prevent showing toast again
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('reason');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [toast, session, hasShownMessage]);

  // Set a timeout to prevent infinite loading - reduced to 5 seconds
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.log("Auth page: Loading timeout reached, proceeding anyway");
        setTimeoutReached(true);
      }, 5000); // Reduced timeout to 5 seconds

      return () => clearTimeout(timer);
    } else {
      setTimeoutReached(false);
    }
  }, [loading]);

  // Show loading state while checking authentication, but with timeout
  if (loading && !timeoutReached) {
    console.log("Auth page: Still loading session...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
          <p className="text-sm text-muted-foreground mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  // If timeout reached but still loading, show auth form anyway
  if (timeoutReached && loading) {
    console.log("Auth page: Loading timeout reached, showing auth form");
  }

  // If already logged in, redirect to dashboard
  if (session && !loading) {
    console.log("Auth page: User is authenticated, redirecting to dashboard");
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  console.log("Auth page: Showing auth container");
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
