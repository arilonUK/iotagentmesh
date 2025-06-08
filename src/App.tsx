
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNav } from "@/components/DashboardNav";
import Header from "@/components/Header";

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show dashboard layout with sidebar
  if (isAuthenticated) {
    return (
      <TooltipProvider>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <DashboardNav />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-4 lg:p-8 bg-gray-50">
                <Outlet />
              </main>
            </div>
          </div>
          <Toaster />
        </SidebarProvider>
      </TooltipProvider>
    );
  }

  // For unauthenticated users, show basic layout
  return (
    <TooltipProvider>
      <Outlet />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
