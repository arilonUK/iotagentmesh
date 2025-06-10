
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
import ProtectedRoute from '@/components/ProtectedRoute';

// Import route configurations
import { settingsRoutes } from './settingsRoutes';
import { dashboardRoutes } from './dashboardRoutes';
import { publicRoutes } from './publicRoutes';

// Import components using lazy loading for pages that exist
const Dashboard = lazy(() => import('@/pages/Dashboard'));

// Define routes
export const routes: RouteObject[] = [
  // Public routes first
  ...publicRoutes,
  
  // Auth route
  {
    path: '/auth',
    element: <Auth />,
  },
  
  // Dashboard routes (includes /dashboard and sub-routes)
  ...dashboardRoutes,
  
  // Settings routes
  ...settingsRoutes,
  
  // Root redirect to dashboard
  {
    path: '/',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
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
    path: '/database-schema',
    element: <ProtectedRoute><DatabaseSchema /></ProtectedRoute>,
  },
  {
    path: '/documentation',
    element: <ProtectedRoute><Documentation /></ProtectedRoute>,
  },
  
  // 404 catch-all route - must be last
  {
    path: '*',
    element: <NotFound />,
  },
];
