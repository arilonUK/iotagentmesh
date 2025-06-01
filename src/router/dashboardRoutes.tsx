
import Dashboard from "@/pages/Dashboard";
import Devices from "@/pages/Devices";
import DeviceDetail from "@/pages/DeviceDetail";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Alarms from "@/pages/Alarms";
import DataBuckets from "@/pages/DataBuckets";
import Documentation from "@/pages/Documentation";
import DeviceManagementGuide from "@/pages/DeviceManagementGuide";
import DataBucketsAnalyticsGuide from "@/pages/DataBucketsAnalyticsGuide";
import AlarmConfigurationGuide from "@/pages/AlarmConfigurationGuide";
import ApiIntegrationGuide from "@/pages/ApiIntegrationGuide";
import Endpoints from "@/pages/Endpoints";
import IntegrationsAndConnectivity from "@/pages/IntegrationsAndConnectivity";
import FileStorage from "@/pages/FileStorage";
import FileExplorerPage from "@/pages/FileExplorerPage";
import NotificationSettings from "@/pages/NotificationSettings";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";

export const dashboardRoutes = [
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
];
