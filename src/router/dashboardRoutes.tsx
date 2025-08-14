
import { Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DeviceDetail = lazy(() => import('@/pages/DeviceDetail'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Billing = lazy(() => import('@/pages/Billing'));
const TeamSettings = lazy(() => import('@/pages/TeamSettings'));

// Lazy load documentation guide pages
const Documentation = lazy(() => import('@/pages/Documentation'));
const DeviceManagementGuide = lazy(() => import('@/pages/DeviceManagementGuide'));
const DataBucketsAnalyticsGuide = lazy(() => import('@/pages/DataBucketsAnalyticsGuide'));
const AlarmConfigurationGuide = lazy(() => import('@/pages/AlarmConfigurationGuide'));
const ApiIntegrationGuide = lazy(() => import('@/pages/ApiIntegrationGuide'));

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
    path: "/dashboard/devices",
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
    path: "/dashboard/products",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <Products />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/products/:id",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <ProductDetail />
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
  {
    path: "/dashboard/documentation",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <Documentation />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // Documentation guide routes
  {
    path: "/dashboard/documentation/device-management",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <DeviceManagementGuide />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/documentation/data-buckets-analytics",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <DataBucketsAnalyticsGuide />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/documentation/alarm-configuration",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <AlarmConfigurationGuide />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/documentation/api-integration",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner />}>
          <ApiIntegrationGuide />
        </Suspense>
      </ProtectedRoute>
    ),
  },
];
