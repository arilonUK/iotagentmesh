
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/contexts/toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    // Show a toast notification when redirecting
    toast({
      title: "Authentication required",
      description: "Please log in to access this page",
      variant: "destructive",
    });
    
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
