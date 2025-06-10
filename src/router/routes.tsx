
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
import ProtectedRoute from '@/components/ProtectedRoute';

// Import route configurations
import { settingsRoutes } from './settingsRoutes';
import { dashboardRoutes } from './dashboardRoutes';

// Import components using lazy loading for pages that exist
const Dashboard = lazy(() => import('@/pages/Dashboard'));

// Define routes
export const routes: RouteObject[] = [
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
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
    path: '/database-schema',
    element: <ProtectedRoute><DatabaseSchema /></ProtectedRoute>,
  },
  // Include settings routes
  ...settingsRoutes,
  // Include dashboard routes
  ...dashboardRoutes,
  {
    path: '*',
    element: <NotFound />,
  },
];
