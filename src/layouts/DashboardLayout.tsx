
import React from 'react';
import { Bell } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { DashboardNav } from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth';
import OrganizationSwitcher from '@/components/OrganizationSwitcher';

const DashboardLayout = () => {
  const { profile } = useAuth();
  
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
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="flex-1 ml-16 md:ml-64 transition-all duration-300">
        <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
            <OrganizationSwitcher />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-iot-error rounded-full"></span>
            </Button>
            <Avatar className="cursor-pointer hover:ring-2 hover:ring-iot-purple-light transition-all">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-iot-purple-light text-white">{getUserInitials()}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
