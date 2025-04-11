
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import DeviceDetail from "./pages/DeviceDetail";
import DashboardLayout from "./layouts/DashboardLayout";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProfileSettings from "./pages/ProfileSettings";
import TeamSettings from "./pages/TeamSettings";
import DataBuckets from "./pages/DataBuckets";
import AcceptInvitation from "./pages/AcceptInvitation";
import Endpoints from "./pages/Endpoints"; // Add import for Endpoints page
import { AuthProvider } from "./contexts/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import React from "react"; // Add explicit React import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            
            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="devices" element={<Devices />} />
                <Route path="devices/:id" element={<DeviceDetail />} />
                <Route path="data-buckets" element={<DataBuckets />} />
                <Route path="endpoints" element={<Endpoints />} /> {/* Add Endpoints route */}
                <Route path="settings/profile" element={<ProfileSettings />} />
                <Route path="settings/team" element={<TeamSettings />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
