
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
import OrganizationSettings from "./pages/OrganizationSettings";
import DataBuckets from "./pages/DataBuckets";
import AcceptInvitation from "./pages/AcceptInvitation";
import Endpoints from "./pages/Endpoints";
import Alarms from "./pages/Alarms";
import { AuthProvider } from "./contexts/auth";
import { OrganizationProvider } from "./contexts/organization";
import ProtectedRoute from "./components/ProtectedRoute";
import React from "react";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <OrganizationProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/accept-invitation" element={<AcceptInvitation />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="devices" element={<Devices />} />
                    <Route path="devices/:id" element={<DeviceDetail />} />
                    <Route path="data-buckets" element={<DataBuckets />} />
                    <Route path="endpoints" element={<Endpoints />} />
                    <Route path="settings/profile" element={<ProfileSettings />} />
                    <Route path="settings/team" element={<TeamSettings />} />
                    <Route path="organization" element={<OrganizationSettings />} />
                    <Route path="alarms" element={<Alarms />} />
                  </Route>
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </OrganizationProvider>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
