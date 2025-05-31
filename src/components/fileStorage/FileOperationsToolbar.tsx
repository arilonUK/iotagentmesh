
import React from 'react';
import { FileCounter } from './FileCounter';
import { FileActions } from './FileActions';

interface FileOperationsToolbarProps {
  fileCount: number;
  isLoading: boolean;
  searchQuery: string;
  currentPath: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateFolder: () => void;
  uploadDialogOpen: boolean;
  setUploadDialogOpen: (open: boolean) => void;
  newFolderDialogOpen: boolean;
  setNewFolderDialogOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
}

export const FileOperationsToolbar: React.FC<FileOperationsToolbarProps> = ({
  fileCount,
  isLoading,
  searchQuery,
  currentPath,
  onUpload,
  onCreateFolder,
  uploadDialogOpen,
  setUploadDialogOpen,
  newFolderDialogOpen,
  setNewFolderDialogOpen,
  newFolderName,
  setNewFolderName
}) => {
  return (
    <div className="flex justify-between items-center">
      <FileCounter 
        count={fileCount}
        isLoading={isLoading}
        searchQuery={searchQuery}
      />
      <FileActions 
        currentPath={currentPath}
        onUpload={onUpload}
        onCreateFolder={onCreateFolder}
        uploadDialogOpen={uploadDialogOpen}
        setUploadDialogOpen={setUploadDialogOpen}
        newFolderDialogOpen={newFolderDialogOpen}
        setNewFolderDialogOpen={setNewFolderDialogOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
      />
    </div>
  );
};
