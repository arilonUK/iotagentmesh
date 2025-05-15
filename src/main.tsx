
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
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'devices', element: <Devices /> },
          { path: 'devices/:id', element: <DeviceDetail /> },
          { path: 'products', element: <Products /> },
          { path: 'products/:id', element: <ProductDetail /> },
          { path: 'alarms', element: <Alarms /> },
          { path: 'data-buckets', element: <DataBuckets /> },
          { path: 'endpoints', element: <Endpoints /> },
          { path: 'integrations', element: <IntegrationsAndConnectivity /> },
          { path: 'api-keys', element: <ApiKeyManagement /> },
          { path: 'oauth', element: <OAuthConnections /> },
          { path: 'file-storage', element: <FileStorage /> },
          { path: 'file-storage/:profileId', element: <FileExplorerPage /> },
          { path: 'notifications/settings', element: <NotificationSettings /> },
          { path: 'team', element: <TeamSettings /> },
          { path: 'profile', element: <ProfileSettings /> },
          { path: 'settings', element: <OrganizationSettings /> },
        ],
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
