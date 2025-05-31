
import React, { useState } from 'react';
import { useStorageFiles } from '@/hooks/useFileStorage';
import { StorageFile } from '@/services/storage';
import { fileService } from '@/services/storage';
import { toast } from 'sonner';
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
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);

  const { 
    files, 
    isLoading, 
    uploadFile, 
    deleteFile, 
    createDirectory,
  } = useStorageFiles(undefined, organizationId, currentPath);

  const handleFileClick = (file: StorageFile) => {
    if (file.mimetype && file.mimetype.includes('folder')) {
      navigateToFolder(file.name);
    } else {
      setSelectedFile(file);
      previewFile(file);
    }
  };

  const navigateToFolder = (folderName: string) => {
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    const file = files[0];
    uploadFile.mutate(
      { file }, 
      {
        onSuccess: () => {
          setUploadDialogOpen(false);
        }
      }
    );
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    
    createDirectory.mutate(
      { dirName: newFolderName },
      {
        onSuccess: () => {
          setNewFolderName('');
          setNewFolderDialogOpen(false);
        }
      }
    );
  };

  const handleDeleteFile = (file: StorageFile) => {
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      deleteFile.mutate(
        { fileName: file.name },
        {
          onSuccess: () => {
            if (selectedFile?.id === file.id) {
              setSelectedFile(null);
              setFilePreviewUrl(null);
            }
          }
        }
      );
    }
  };

  const downloadFile = async (file: StorageFile) => {
    const url = await fileService.getFileUrl(organizationId, currentPath, file.name);
    if (!url) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
  };

  const previewFile = async (file: StorageFile) => {
    if (
      file.mimetype?.startsWith('image/') || 
      file.mimetype?.startsWith('text/') || 
      file.mimetype?.includes('pdf')
    ) {
      const url = await fileService.getFileUrl(organizationId, currentPath, file.name);
      if (url) {
        setFilePreviewUrl(url);
        setFilePreviewOpen(true);
      }
    } else {
      toast.info('Preview not available for this file type');
    }
  };

  const filteredFiles = searchQuery
    ? files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  return (
    <div className="space-y-4">
      <NavigationToolbar
        currentPath={currentPath}
        searchQuery={searchQuery}
        onNavigateUp={navigateUp}
        onSearchChange={setSearchQuery}
      />
      
      <FileOperationsToolbar
        fileCount={filteredFiles.length}
        isLoading={isLoading}
        searchQuery={searchQuery}
        currentPath={currentPath}
        onUpload={handleUpload}
        onCreateFolder={handleCreateFolder}
        uploadDialogOpen={uploadDialogOpen}
        setUploadDialogOpen={setUploadDialogOpen}
        newFolderDialogOpen={newFolderDialogOpen}
        setNewFolderDialogOpen={setNewFolderDialogOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
      />
      
      <FileContentArea
        files={filteredFiles}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onFileClick={handleFileClick}
        onPreview={previewFile}
        onDownload={downloadFile}
        onDelete={handleDeleteFile}
      />
      
      <FilePreview 
        open={filePreviewOpen}
        onOpenChange={setFilePreviewOpen}
        file={selectedFile}
        previewUrl={filePreviewUrl}
        onDownload={downloadFile}
      />
    </div>
  );
};
