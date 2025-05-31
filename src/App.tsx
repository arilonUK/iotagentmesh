
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppProvider from '@/AppProvider';
import Auth from '@/pages/Auth';
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
import ProfileSettings from '@/pages/ProfileSettings';
import TeamSettings from '@/pages/TeamSettings';
import OrganizationSettings from '@/pages/OrganizationSettings';
import NotificationSettings from '@/pages/NotificationSettings';
import Documentation from '@/pages/Documentation';
import AcceptInvitation from '@/pages/AcceptInvitation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="iot-ui-theme">
      <AppProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            
            {/* Protected dashboard routes */}
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
            
            <Route path="/dashboard/devices/:deviceId" element={
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
            
            <Route path="/dashboard/products/:productId" element={
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
            
            <Route path="/dashboard/file-storage/:profileId" element={
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
            
            <Route path="/dashboard/team" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TeamSettings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OrganizationSettings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/notifications/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NotificationSettings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/documentation" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Documentation />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
