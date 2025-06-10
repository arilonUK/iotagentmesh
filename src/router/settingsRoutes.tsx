
import { Navigate } from "react-router-dom";
import ProfileSettings from "@/pages/ProfileSettings";
import OrganizationSettings from "@/pages/OrganizationSettings";
import TeamSettings from "@/pages/TeamSettings";
import OAuthConnections from "@/pages/OAuthConnections";
import ApiKeyManagement from "@/pages/ApiKeyManagement";
import ProtectedRoute from "@/components/ProtectedRoute";

export const settingsRoutes = [
  {
    path: "/dashboard/settings",
    element: (
      <ProtectedRoute>
        <ProfileSettings />
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
        <OrganizationSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/settings/team",
    element: (
      <ProtectedRoute>
        <TeamSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/settings/oauth",
    element: (
      <ProtectedRoute>
        <OAuthConnections />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/settings/api-keys",
    element: (
      <ProtectedRoute>
        <ApiKeyManagement />
      </ProtectedRoute>
    ),
  },
];
