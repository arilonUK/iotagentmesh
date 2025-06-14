
import { Navigate } from "react-router-dom";
import { lazy } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DeviceDetail = lazy(() => import('@/pages/DeviceDetail'));
const Billing = lazy(() => import('@/pages/Billing'));

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
  {
    path: "/billing",
    element: (
      <ProtectedRoute>
        <Billing />
      </ProtectedRoute>
    ),
  },
  // Redirect /dashboard/* routes that don't match to the main dashboard
  {
    path: "/dashboard/*",
    element: <Navigate to="/dashboard" replace />,
  },
];
