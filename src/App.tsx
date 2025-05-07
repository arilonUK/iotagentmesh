
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
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';

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
import NotificationSettings from './pages/NotificationSettings';

const queryClient = new QueryClient();

export default function App() {
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
                
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/devices" element={<ProtectedRoute><Devices /></ProtectedRoute>} />
                <Route path="/dashboard/devices/:id" element={<ProtectedRoute><DeviceDetail /></ProtectedRoute>} />
                <Route path="/dashboard/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/dashboard/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
                <Route path="/dashboard/alarms" element={<ProtectedRoute><Alarms /></ProtectedRoute>} />
                <Route path="/dashboard/data-buckets" element={<ProtectedRoute><DataBuckets /></ProtectedRoute>} />
                <Route path="/dashboard/endpoints" element={<ProtectedRoute><Endpoints /></ProtectedRoute>} />
                <Route path="/dashboard/file-storage" element={<ProtectedRoute><FileStorage /></ProtectedRoute>} />
                <Route path="/dashboard/file-storage/:id" element={<ProtectedRoute><FileExplorerPage /></ProtectedRoute>} />
                <Route path="/dashboard/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                <Route path="/dashboard/organization" element={<ProtectedRoute><OrganizationSettings /></ProtectedRoute>} />
                <Route path="/dashboard/team" element={<ProtectedRoute><TeamSettings /></ProtectedRoute>} />
                
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/notification-settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
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
