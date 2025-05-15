
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import DashboardLayout from './layouts/DashboardLayout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Devices from './pages/Devices.tsx';
import DeviceDetail from './pages/DeviceDetail.tsx';
import Products from './pages/Products.tsx';
import Alarms from './pages/Alarms.tsx';
import DataBuckets from './pages/DataBuckets.tsx';
import TeamSettings from './pages/TeamSettings.tsx';
import ProfileSettings from './pages/ProfileSettings.tsx';
import ProductDetail from './pages/ProductDetail.tsx';
import OrganizationSettings from './pages/OrganizationSettings.tsx';
import Auth from './pages/Auth.tsx';
import NotFound from './pages/NotFound.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AcceptInvitation from './pages/AcceptInvitation.tsx';
import FileStorage from './pages/FileStorage.tsx';
import FileExplorerPage from './pages/FileExplorerPage.tsx';
import Endpoints from './pages/Endpoints.tsx';
import NotificationSettings from './pages/NotificationSettings.tsx';
import Index from './pages/Index.tsx';
import Blog from './pages/Blog.tsx';
import BlogPost from './pages/BlogPost.tsx';
import ApiKeyManagement from './pages/ApiKeyManagement.tsx';
import OAuthConnections from './pages/OAuthConnections.tsx';
import IntegrationsAndConnectivity from './pages/IntegrationsAndConnectivity.tsx';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppProvider from './AppProvider.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Index /> },
      { path: 'blog', element: <Blog /> },
      { path: 'blog/:slug', element: <BlogPost /> },
      { path: 'auth', element: <Auth /> },
      { path: 'accept-invitation', element: <AcceptInvitation /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/devices',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Devices />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/devices/:id',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <DeviceDetail />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/products',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/products/:id',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <ProductDetail />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/alarms',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Alarms />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/data-buckets',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <DataBuckets />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/endpoints',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Endpoints />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/integrations',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <IntegrationsAndConnectivity />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/api-keys',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <ApiKeyManagement />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/oauth',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <OAuthConnections />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/file-storage',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <FileStorage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/file-storage/:profileId',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <FileExplorerPage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/notifications/settings',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationSettings />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/team',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <TeamSettings />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/profile',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <ProfileSettings />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/settings',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <OrganizationSettings />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
