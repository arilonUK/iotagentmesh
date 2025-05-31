
import React from 'react';

interface EmptyStateProps {
  searchQuery?: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  searchQuery,
  message
}) => {
  const defaultMessage = searchQuery 
    ? 'No files match your search' 
    : 'This folder is empty';

  return (
    <div className="text-center py-8 border rounded-md bg-muted/20">
      {message || defaultMessage}
    </div>
  );
};
