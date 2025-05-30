
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Additional check to ensure dashboard pages remain protected
    if (!loading && !session) {
      console.log("Protected route: No active session detected in effect");
    }
  }, [session, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    console.log("No active session, redirecting to auth page");
    
    // Redirect to auth page with a reason parameter and save the current location
    return <Navigate to="/auth?reason=protected" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
