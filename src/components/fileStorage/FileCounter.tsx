
import React from 'react';

interface FileCounterProps {
  count: number;
  isLoading?: boolean;
  searchQuery?: string;
}

export const FileCounter: React.FC<FileCounterProps> = ({
  count,
  isLoading = false,
  searchQuery
}) => {
  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="text-sm text-muted-foreground">
      {count} item{count !== 1 ? 's' : ''}
      {searchQuery && ` matching "${searchQuery}"`}
    </div>
  );
};
