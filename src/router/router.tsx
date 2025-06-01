
import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import NotFound from "@/pages/NotFound";
import { allRoutes } from "./routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: allRoutes,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
