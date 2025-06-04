
import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import NotFound from "@/pages/NotFound";
import { routes } from "./routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: routes,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
