
import React from 'react';
import { cn } from '@/lib/utils';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: number;
}

export const DashboardLayout = ({ children, className }: DashboardLayoutProps) => {
  return (
    <div className={cn("w-full space-y-4", className)}>
      {children}
    </div>
  );
};

export const DashboardGrid = ({ 
  children, 
  className, 
  columns = 2
}: DashboardGridProps) => {
  return (
    <div 
      className={cn(
        "grid gap-4", 
        {
          'grid-cols-1 md:grid-cols-2': columns === 2,
          'grid-cols-1 md:grid-cols-3': columns === 3,
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-4': columns === 4,
        },
        className
      )}
    >
      {children}
    </div>
  );
};
