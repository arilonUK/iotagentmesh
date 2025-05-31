
import React from 'react';
import { Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth';
import OrganizationSwitcher from '@/components/OrganizationSwitcher';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { profile } = useAuth();
  const { pathname } = useLocation();
  
  // Get page title based on route
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.includes('/devices')) return 'Devices';
    if (pathname.includes('/endpoints')) return 'Endpoints';
    if (pathname.includes('/alarms')) return 'Alarms';
    if (pathname.includes('/data-buckets')) return 'Data Buckets';
    if (pathname.includes('/file-storage')) return 'File Storage';
    if (pathname.includes('/settings/profile')) return 'Profile Settings';
    if (pathname.includes('/settings/team')) return 'Team Management';
    if (pathname.includes('/organization')) return 'Organization Settings';
    if (pathname.includes('/notification-settings')) return 'Notification Settings';
    return 'Dashboard';
  };
  
  // Helper function to get user initials
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    } else if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardNav />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h1>
              <OrganizationSwitcher />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-blue-500 text-white">{getUserInitials()}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8 bg-gray-50">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
