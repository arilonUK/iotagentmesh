
import { StrictMode } from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppProvider from "@/AppProvider";
import { router } from "@/router/router";

export const AppProviders = () => {
  return (
    <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="iot-ui-theme">
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </ThemeProvider>
    </StrictMode>
  );
};
