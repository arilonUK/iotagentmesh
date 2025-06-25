
import { Navigate } from "react-router-dom";
import { lazy } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DeviceDetail = lazy(() => import('@/pages/DeviceDetail'));
const Billing = lazy(() => import('@/pages/Billing'));
const TeamSettings = lazy(() => import('@/pages/TeamSettings'));

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
    path: "/dashboard/team",
    element: (
      <ProtectedRoute>
        <TeamSettings />
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
  {
    path: "/dashboard/billing",
    element: (
      <ProtectedRoute>
        <Billing />
      </ProtectedRoute>
    ),
  },
];
