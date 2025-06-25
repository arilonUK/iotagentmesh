
import { Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DeviceDetail = lazy(() => import('@/pages/DeviceDetail'));
const Billing = lazy(() => import('@/pages/Billing'));
const TeamSettings = lazy(() => import('@/pages/TeamSettings'));

// Loading component for suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-48">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export const dashboardRoutes = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <Dashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/devices/:id",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <DeviceDetail />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/team",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <TeamSettings />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/billing",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <Billing />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/billing",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <Billing />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
