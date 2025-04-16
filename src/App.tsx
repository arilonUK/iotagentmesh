
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Devices from '@/pages/Devices';
import DeviceDetail from '@/pages/DeviceDetail';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Alarms from '@/pages/Alarms';
import DataBuckets from '@/pages/DataBuckets';
import Endpoints from '@/pages/Endpoints';
import FileStorage from '@/pages/FileStorage';
import FileExplorerPage from '@/pages/FileExplorerPage';

import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import ProfileSettings from '@/pages/ProfileSettings';
import OrganizationSettings from '@/pages/OrganizationSettings';
import TeamSettings from '@/pages/TeamSettings';
import AcceptInvitation from '@/pages/AcceptInvitation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';

import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth';
import { OrganizationProvider } from '@/contexts/organization';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <OrganizationProvider>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="devices" element={<Devices />} />
                    <Route path="devices/:id" element={<DeviceDetail />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/:id" element={<ProductDetail />} />
                    <Route path="alarms" element={<Alarms />} />
                    <Route path="data-buckets" element={<DataBuckets />} />
                    <Route path="endpoints" element={<Endpoints />} />
                    <Route path="file-storage" element={<FileStorage />} />
                    <Route path="file-storage/:id" element={<FileExplorerPage />} />
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="organization" element={<OrganizationSettings />} />
                    <Route path="team" element={<TeamSettings />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </ThemeProvider>
          </OrganizationProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
