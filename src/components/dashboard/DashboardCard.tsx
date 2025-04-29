
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface DashboardCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  fullHeight?: boolean;
  headerAction?: React.ReactNode;
  footerAction?: React.ReactNode;
}

export const DashboardCard = ({
  title,
  description,
  children,
  className,
  loading = false,
  error = null,
  fullHeight = false,
  headerAction,
  footerAction
}: DashboardCardProps) => {
  return (
    <Card className={cn(fullHeight && "h-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {headerAction && (
            <div className="ml-auto">{headerAction}</div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn("relative", !footerAction && "pb-6")}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-destructive">Error loading data</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : (
          children
        )}
        {footerAction && (
          <div className="mt-4 pt-2 border-t flex justify-end">
            {footerAction}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
