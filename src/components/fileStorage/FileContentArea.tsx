
import React from 'react';
import { StorageFile } from '@/services/storage/interfaces/IFileStorageService';
import { FileList } from './FileList';
import { EmptyState } from './EmptyState';

interface FileContentAreaProps {
  files: StorageFile[];
  isLoading: boolean;
  searchQuery: string;
  onFileClick: (file: StorageFile) => void;
  onPreview: (file: StorageFile) => void;
  onDownload: (file: StorageFile) => void;
  onDelete: (file: StorageFile) => void;
  onMarkOffline?: (file: StorageFile) => void;
  onRemoveOffline?: (file: StorageFile) => void;
}

export const FileContentArea: React.FC<FileContentAreaProps> = ({
  files,
  isLoading,
  searchQuery,
  onFileClick,
  onPreview,
  onDownload,
  onDelete,
  onMarkOffline,
  onRemoveOffline
}) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading files...</div>;
  }

  if (files.length === 0) {
    return <EmptyState searchQuery={searchQuery} />;
  }

  return (
    <FileList
      files={files}
      onFileClick={onFileClick}
      onPreview={onPreview}
      onDownload={onDownload}
      onDelete={onDelete}
      onMarkOffline={onMarkOffline}
      onRemoveOffline={onRemoveOffline}
    />
  );
};
