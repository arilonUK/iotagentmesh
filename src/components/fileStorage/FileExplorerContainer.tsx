
import React, { useState } from 'react';
import { useStorageFiles } from '@/hooks/useFileStorage';
import { useFileNavigation } from '@/hooks/useFileNavigation';
import { useFileDialogs } from '@/hooks/useFileDialogs';
import { useFileOperations } from '@/hooks/useFileOperations';
import { NavigationToolbar } from './NavigationToolbar';
import { FileOperationsToolbar } from './FileOperationsToolbar';
import { FileContentArea } from './FileContentArea';
import { FilePreviewSystem } from './FilePreviewSystem';
import { FileOperationStatus } from './FileOperationStatus';
import { Button } from '@/components/ui/button';
import { Activity, Wifi, WifiOff } from 'lucide-react';

interface FileExplorerContainerProps {
  organizationId: string;
  initialPath?: string;
}

export const FileExplorerContainer: React.FC<FileExplorerContainerProps> = ({
  organizationId,
  initialPath = ''
}) => {
  const navigation = useFileNavigation(initialPath);
  const dialogs = useFileDialogs();
  const [showOperationStatus, setShowOperationStatus] = useState(false);
  
  const { 
    files, 
    isLoading, 
    uploadFile, 
    deleteFile, 
    createDirectory,
    operations,
    markForOffline,
    removeOfflineAccess,
    syncOfflineChanges,
    isOffline
  } = useStorageFiles(undefined, organizationId, navigation.currentPath);

  const fileOps = useFileOperations({
    organizationId,
    currentPath: navigation.currentPath,
    uploadFile,
    deleteFile,
    createDirectory,
    setSelectedFile: dialogs.setSelectedFile,
    setFilePreviewUrl: dialogs.setFilePreviewUrl,
    setFilePreviewOpen: dialogs.setFilePreviewOpen
  });

  const handleFileClick = (file: any) => {
    const result = fileOps.handleFileClick(file);
    if (result.action === 'navigate') {
      navigation.navigateToFolder(result.folderName);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    fileOps.handleUpload(e);
    dialogs.resetUploadDialog();
  };

  const handleCreateFolder = () => {
    fileOps.handleCreateFolder(dialogs.newFolderName);
    dialogs.resetFolderDialog();
  };

  const handleDeleteFile = (file: any) => {
    fileOps.handleDeleteFile(file, dialogs.selectedFile);
  };

  const filteredFiles = navigation.searchQuery
    ? files.filter(file => file.name.toLowerCase().includes(navigation.searchQuery.toLowerCase()))
    : files;

  const hasActiveOperations = operations.some(op => 
    op.status === 'pending' || op.status === 'in-progress' || op.status === 'offline-queued'
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <NavigationToolbar
          currentPath={navigation.currentPath}
          searchQuery={navigation.searchQuery}
          onNavigateUp={navigation.navigateUp}
          onSearchChange={navigation.setSearchQuery}
        />
        
        <div className="flex items-center gap-2">
          {isOffline && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={syncOfflineChanges}
                className="text-orange-600"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Sync Offline Changes
              </Button>
            </>
          )}
          
          {hasActiveOperations && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOperationStatus(!showOperationStatus)}
              className="relative"
            >
              <Activity className="h-4 w-4 mr-2" />
              Operations
              {operations.filter(op => op.status === 'in-progress').length > 0 && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </Button>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            {isOffline ? (
              <WifiOff className="h-4 w-4 text-orange-500" />
            ) : (
              <Wifi className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
      </div>
      
      <FileOperationsToolbar
        fileCount={filteredFiles.length}
        isLoading={isLoading}
        searchQuery={navigation.searchQuery}
        currentPath={navigation.currentPath}
        onUpload={handleUpload}
        onCreateFolder={handleCreateFolder}
        uploadDialogOpen={dialogs.uploadDialogOpen}
        setUploadDialogOpen={dialogs.setUploadDialogOpen}
        newFolderDialogOpen={dialogs.newFolderDialogOpen}
        setNewFolderDialogOpen={dialogs.setNewFolderDialogOpen}
        newFolderName={dialogs.newFolderName}
        setNewFolderName={dialogs.setNewFolderName}
      />
      
      <FileContentArea
        files={filteredFiles}
        isLoading={isLoading}
        searchQuery={navigation.searchQuery}
        onFileClick={handleFileClick}
        onPreview={fileOps.previewFile}
        onDownload={fileOps.downloadFile}
        onDelete={handleDeleteFile}
        onMarkOffline={markForOffline}
        onRemoveOffline={removeOfflineAccess}
      />
      
      <FilePreviewSystem
        file={dialogs.selectedFile}
        organizationId={organizationId}
        isOpen={dialogs.filePreviewOpen}
        onClose={() => dialogs.setFilePreviewOpen(false)}
      />
      
      <FileOperationStatus
        isOpen={showOperationStatus}
        onClose={() => setShowOperationStatus(false)}
      />
    </div>
  );
};
