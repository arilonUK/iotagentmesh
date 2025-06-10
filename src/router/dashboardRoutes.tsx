
import { Navigate } from "react-router-dom";
import { lazy } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load the Dashboard component
const Dashboard = lazy(() => import('@/pages/Dashboard'));

export const dashboardRoutes = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  // Redirect /dashboard/* routes that don't match to the main dashboard
  {
    path: "/dashboard/*",
    element: <Navigate to="/dashboard" replace />,
  },
];
