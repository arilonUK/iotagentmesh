
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import AppProvider from "./AppProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import DeviceDetail from "./pages/DeviceDetail";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Alarms from "./pages/Alarms";
import DataBuckets from "./pages/DataBuckets";
import Documentation from "./pages/Documentation";
import DeviceManagementGuide from "./pages/DeviceManagementGuide";
import DataBucketsAnalyticsGuide from "./pages/DataBucketsAnalyticsGuide";
import Endpoints from "./pages/Endpoints";
import FileStorage from "./pages/FileStorage";
import FileExplorerPage from "./pages/FileExplorerPage";
import NotificationSettings from "./pages/NotificationSettings";
import ProfileSettings from "./pages/ProfileSettings";
import OrganizationSettings from "./pages/OrganizationSettings";
import TeamSettings from "./pages/TeamSettings";
import AcceptInvitation from "./pages/AcceptInvitation";
import ApiKeyManagement from "./pages/ApiKeyManagement";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import IntegrationsAndConnectivity from "./pages/IntegrationsAndConnectivity";
import OAuthConnections from "./pages/OAuthConnections";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import AlarmConfigurationGuide from "./pages/AlarmConfigurationGuide";
import ApiIntegrationGuide from "./pages/ApiIntegrationGuide";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/auth",
        element: <Auth />,
      },
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/blog/:slug",
        element: <BlogPost />,
      },
      {
        path: "/accept-invitation/:token",
        element: <AcceptInvitation />,
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/devices",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Devices />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/devices/:id",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <DeviceDetail />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/products",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/products/:id",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <ProductDetail />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/alarms",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Alarms />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/data-buckets",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <DataBuckets />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/documentation",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Documentation />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/documentation/device-management",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <DeviceManagementGuide />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/documentation/data-buckets-analytics",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <DataBucketsAnalyticsGuide />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/documentation/alarm-configuration",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <AlarmConfigurationGuide />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/documentation/api-integration",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <ApiIntegrationGuide />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/endpoints",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Endpoints />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/integrations",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <IntegrationsAndConnectivity />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/file-storage",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <FileStorage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/file-storage/:profileId",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <FileExplorerPage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/notifications/settings",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationSettings />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/settings",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <ProfileSettings />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/settings/organization",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <OrganizationSettings />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/settings/team",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <TeamSettings />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/settings/oauth",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <OAuthConnections />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/settings/api-keys",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <ApiKeyManagement />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
