
import { Navigate } from "react-router-dom";
import { lazy } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load the Dashboard and DeviceDetail components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DeviceDetail = lazy(() => import('@/pages/DeviceDetail'));

export const dashboardRoutes = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/devices/:id",
    element: (
      <ProtectedRoute>
        <DeviceDetail />
      </ProtectedRoute>
    ),
  },
  // Redirect /dashboard/* routes that don't match to the main dashboard
  {
    path: "/dashboard/*",
    element: <Navigate to="/dashboard" replace />,
  },
];
