
import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

import { Toaster } from '@/components/ui/toaster';
import { OrganizationProvider } from '@/contexts/organization';
import NotificationSettings from './pages/NotificationSettings';

export default function App() {
  return (
    <OrganizationProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
        
        {/* Public routes */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        
        {/* All dashboard routes should be wrapped with DashboardLayout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/devices" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Devices />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/devices/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <DeviceDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/products" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/products/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProductDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/alarms" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Alarms />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/data-buckets" element={
          <ProtectedRoute>
            <DashboardLayout>
              <DataBuckets />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/endpoints" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Endpoints />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/file-storage" element={
          <ProtectedRoute>
            <DashboardLayout>
              <FileStorage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/file-storage/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <FileExplorerPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/profile" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfileSettings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/organization" element={
          <ProtectedRoute>
            <DashboardLayout>
              <OrganizationSettings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/team" element={
          <ProtectedRoute>
            <DashboardLayout>
              <TeamSettings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/notification-settings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationSettings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </OrganizationProvider>
  );
}
