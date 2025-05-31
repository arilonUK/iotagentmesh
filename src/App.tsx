
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="iot-ui-theme">
      <AppProvider>
        <Outlet />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
