
import { StrictMode } from "react";
import { RouterProvider } from "react-router-dom";
import AppProvider from "@/AppProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { router } from "@/router/router";

export const AppProviders = () => {
  return (
    <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </ThemeProvider>
    </StrictMode>
  );
};
