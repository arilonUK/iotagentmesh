
import React from 'react';
import { useStorageFiles } from '@/hooks/useFileStorage';
import { useFileNavigation } from '@/hooks/useFileNavigation';
import { useFileDialogs } from '@/hooks/useFileDialogs';
import { useFileOperations } from '@/hooks/useFileOperations';
import { NavigationToolbar } from './NavigationToolbar';
import { FileOperationsToolbar } from './FileOperationsToolbar';
import { FileContentArea } from './FileContentArea';
import { FilePreview } from './FilePreview';

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
  
  const { 
    files, 
    isLoading, 
    uploadFile, 
    deleteFile, 
    createDirectory,
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

  return (
    <div className="space-y-4">
      <NavigationToolbar
        currentPath={navigation.currentPath}
        searchQuery={navigation.searchQuery}
        onNavigateUp={navigation.navigateUp}
        onSearchChange={navigation.setSearchQuery}
      />
      
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
      />
      
      <FilePreview 
        open={dialogs.filePreviewOpen}
        onOpenChange={dialogs.setFilePreviewOpen}
        file={dialogs.selectedFile}
        previewUrl={dialogs.filePreviewUrl}
        onDownload={fileOps.downloadFile}
      />
    </div>
  );
};
