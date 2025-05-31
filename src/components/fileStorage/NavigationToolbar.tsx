
import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { SearchFiles } from './SearchFiles';

interface NavigationToolbarProps {
  currentPath: string;
  searchQuery: string;
  onNavigateUp: () => void;
  onSearchChange: (query: string) => void;
}

export const NavigationToolbar: React.FC<NavigationToolbarProps> = ({
  currentPath,
  searchQuery,
  onNavigateUp,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Breadcrumb 
        currentPath={currentPath}
        onNavigateUp={onNavigateUp}
        disabled={!currentPath}
      />
      <SearchFiles 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
    </div>
  );
};
