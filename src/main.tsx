
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
import { Outlet } from "react-router-dom";

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
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "",
            element: <Dashboard />,
          },
          {
            path: "devices",
            element: <Devices />,
          },
          {
            path: "devices/:id",
            element: <DeviceDetail />,
          },
          {
            path: "products",
            element: <Products />,
          },
          {
            path: "products/:id",
            element: <ProductDetail />,
          },
          {
            path: "alarms",
            element: <Alarms />,
          },
          {
            path: "data-buckets",
            element: <DataBuckets />,
          },
          {
            path: "documentation",
            element: <Documentation />,
          },
          {
            path: "documentation/device-management",
            element: <DeviceManagementGuide />,
          },
          {
            path: "endpoints",
            element: <Endpoints />,
          },
          {
            path: "integrations",
            element: <IntegrationsAndConnectivity />,
          },
          {
            path: "file-storage",
            element: <FileStorage />,
          },
          {
            path: "file-storage/:profileId",
            element: <FileExplorerPage />,
          },
          {
            path: "notifications/settings",
            element: <NotificationSettings />,
          },
          {
            path: "settings",
            element: <ProfileSettings />,
          },
          {
            path: "settings/organization",
            element: <OrganizationSettings />,
          },
          {
            path: "settings/team",
            element: <TeamSettings />,
          },
          {
            path: "settings/oauth",
            element: <OAuthConnections />,
          },
          {
            path: "settings/api-keys",
            element: <ApiKeyManagement />,
          },
        ],
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
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ThemeProvider>
  </StrictMode>
);
