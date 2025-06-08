
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router/router";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppProvider from "@/AppProvider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="iot-ui-theme">
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </ThemeProvider>
);
