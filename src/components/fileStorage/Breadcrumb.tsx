
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BreadcrumbProps {
  currentPath: string;
  onNavigateUp: () => void;
  disabled?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentPath,
  onNavigateUp,
  disabled = false
}) => {
  return (
    <div className="flex items-center flex-1">
      <Button 
        variant="outline" 
        size="icon"
        onClick={onNavigateUp}
        disabled={disabled}
        className="mr-2"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="bg-muted px-3 py-2 rounded-md flex-1 overflow-x-auto whitespace-nowrap">
        {currentPath || 'Root'}
      </div>
    </div>
  );
};
