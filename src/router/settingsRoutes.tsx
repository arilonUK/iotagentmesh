
import { Navigate } from "react-router-dom";
import ProfileSettings from "@/pages/ProfileSettings";
import OrganizationSettings from "@/pages/OrganizationSettings";
import TeamSettings from "@/pages/TeamSettings";
import OAuthConnections from "@/pages/OAuthConnections";
import ApiKeyManagement from "@/pages/ApiKeyManagement";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";

export const settingsRoutes = [
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
    path: "/dashboard/profile",
    element: <Navigate to="/dashboard/settings" replace />,
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
];
