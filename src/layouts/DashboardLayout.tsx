
import React from 'react';
import { Bell } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import DashboardNav from '@/components/DashboardNav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <div className="flex-1 md:ml-64">
        <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-4 lg:px-8">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-iot-error rounded-full"></span>
            </Button>
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>JD</AvatarFallback>
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
