
import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import NotFound from "@/pages/NotFound";
import { publicRoutes, dashboardRoutes, settingsRoutes } from "./routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      ...publicRoutes,
      ...dashboardRoutes,
      ...settingsRoutes,
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
