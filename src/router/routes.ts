
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// Import existing pages
import Devices from '@/pages/Devices';
import Endpoints from '@/pages/Endpoints';
import Products from '@/pages/Products';
import Alarms from '@/pages/Alarms';
import NotFound from '@/pages/NotFound';
import DatabaseSchema from '@/pages/DatabaseSchema';

// Import components using lazy loading for pages that exist
const Dashboard = lazy(() => import('@/pages/Dashboard'));

// Define routes
export const routes: RouteObject[] = [
  {
    path: '/',
    element: Dashboard,
  },
  {
    path: '/dashboard',
    element: Dashboard,
  },
  {
    path: '/devices',
    element: Devices,
  },
  {
    path: '/endpoints',
    element: Endpoints,
  },
  {
    path: '/products',
    element: Products,
  },
  {
    path: '/alarms',
    element: Alarms,
  },
  {
    path: '/database-schema',
    element: DatabaseSchema,
  },
  {
    path: '*',
    element: NotFound,
  },
];
