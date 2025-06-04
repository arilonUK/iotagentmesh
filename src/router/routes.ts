
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// Import pages
import Devices from '@/pages/Devices';
import NewDevice from '@/pages/NewDevice';
import EditDevice from '@/pages/EditDevice';
import Endpoints from '@/pages/Endpoints';
import NewEndpoint from '@/pages/NewEndpoint';
import EditEndpoint from '@/pages/EditEndpoint';
import Products from '@/pages/Products';
import NewProduct from '@/pages/NewProduct';
import EditProduct from '@/pages/EditProduct';
import Alarms from '@/pages/Alarms';
import NewAlarm from '@/pages/NewAlarm';
import EditAlarm from '@/pages/EditAlarm';
import ApiKeys from '@/pages/ApiKeys';
import NewApiKey from '@/pages/NewApiKey';
import EditApiKey from '@/pages/EditApiKey';
import AuditLogs from '@/pages/AuditLogs';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import Organization from '@/pages/Organization';
import DataExplorer from '@/pages/DataExplorer';
import DataVisualizer from '@/pages/DataVisualizer';
import NotFound from '@/pages/NotFound';
import DatabaseSchema from '@/pages/DatabaseSchema';

// Import components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'));

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
    path: '/login',
    element: Login,
  },
  {
    path: '/register',
    element: Register,
  },
  {
    path: '/forgot-password',
    element: ForgotPassword,
  },
  {
    path: '/reset-password',
    element: ResetPassword,
  },
  {
    path: '/verify-email',
    element: VerifyEmail,
  },
  {
    path: '/devices',
    element: Devices,
  },
  {
    path: '/devices/new',
    element: NewDevice,
  },
  {
    path: '/devices/:id/edit',
    element: EditDevice,
  },
  {
    path: '/endpoints',
    element: Endpoints,
  },
  {
    path: '/endpoints/new',
    element: NewEndpoint,
  },
  {
    path: '/endpoints/:id/edit',
    element: EditEndpoint,
  },
  {
    path: '/products',
    element: Products,
  },
  {
    path: '/products/new',
    element: NewProduct,
  },
  {
    path: '/products/:id/edit',
    element: EditProduct,
  },
  {
    path: '/alarms',
    element: Alarms,
  },
  {
    path: '/alarms/new',
    element: NewAlarm,
  },
  {
    path: '/alarms/:id/edit',
    element: EditAlarm,
  },
  {
    path: '/api-keys',
    element: ApiKeys,
  },
  {
    path: '/api-keys/new',
    element: NewApiKey,
  },
  {
    path: '/api-keys/:id/edit',
    element: EditApiKey,
  },
  {
    path: '/audit-logs',
    element: AuditLogs,
  },
  {
    path: '/settings',
    element: Settings,
  },
  {
    path: '/profile',
    element: Profile,
  },
  {
    path: '/organization',
    element: Organization,
  },
  {
    path: '/data-explorer',
    element: DataExplorer,
  },
  {
    path: '/data-visualizer',
    element: DataVisualizer,
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
