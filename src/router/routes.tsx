
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// Import existing pages
import Devices from '@/pages/Devices';
import Endpoints from '@/pages/Endpoints';
import Products from '@/pages/Products';
import Alarms from '@/pages/Alarms';
import NotFound from '@/pages/NotFound';
import DatabaseSchema from '@/pages/DatabaseSchema';
import Auth from '@/pages/Auth';
import Documentation from '@/pages/Documentation';
import DataBuckets from '@/pages/DataBuckets';
import IntegrationsAndConnectivity from '@/pages/IntegrationsAndConnectivity';
import FileStorage from '@/pages/FileStorage';
import NotificationSettings from '@/pages/NotificationSettings';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Navigate } from 'react-router-dom';

// Import route configurations
import { settingsRoutes } from './settingsRoutes';
import { dashboardRoutes } from './dashboardRoutes';
import { publicRoutes } from './publicRoutes';

// Import components using lazy loading for pages that exist
const Dashboard = lazy(() => import('@/pages/Dashboard'));

// Define routes
export const routes: RouteObject[] = [
  // Public routes first (including auth)
  ...publicRoutes,
  
  // Root redirect to dashboard for authenticated users
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  
  // Dashboard routes (includes /dashboard and sub-routes)
  ...dashboardRoutes,
  
  // Settings routes
  ...settingsRoutes,
  
  // Redirect /settings to /dashboard/settings
  {
    path: '/settings',
    element: <Navigate to="/dashboard/settings" replace />,
  },
  
  // Legacy routes for backward compatibility
  {
    path: '/devices',
    element: <ProtectedRoute><Devices /></ProtectedRoute>,
  },
  {
    path: '/endpoints',
    element: <ProtectedRoute><Endpoints /></ProtectedRoute>,
  },
  {
    path: '/products',
    element: <ProtectedRoute><Products /></ProtectedRoute>,
  },
  {
    path: '/alarms',
    element: <ProtectedRoute><Alarms /></ProtectedRoute>,
  },
  {
    path: '/data-buckets',
    element: <ProtectedRoute><DataBuckets /></ProtectedRoute>,
  },
  {
    path: '/integrations',
    element: <ProtectedRoute><IntegrationsAndConnectivity /></ProtectedRoute>,
  },
  {
    path: '/file-storage',
    element: <ProtectedRoute><FileStorage /></ProtectedRoute>,
  },
  {
    path: '/database-schema',
    element: <ProtectedRoute><DatabaseSchema /></ProtectedRoute>,
  },
  {
    path: '/documentation',
    element: <ProtectedRoute><Documentation /></ProtectedRoute>,
  },
  {
    path: '/notifications/settings',
    element: <ProtectedRoute><NotificationSettings /></ProtectedRoute>,
  },
  
  // 404 catch-all route - must be last
  {
    path: '*',
    element: <NotFound />,
  },
];
