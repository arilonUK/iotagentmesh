
import { useState } from 'react';
import { StorageFile } from '@/services/storage/interfaces/IFileStorageService';
import { fileStorageService } from '@/services/storage/FileStorageService';
import { toast } from 'sonner';

interface UseFileOperationsProps {
  organizationId: string;
  currentPath: string;
  uploadFile: (args: { file: File; onProgress?: (progress: number) => void }) => Promise<void>;
  deleteFile: (args: { fileName: string }) => Promise<void>;
  createDirectory: (args: { dirName: string }) => Promise<void>;
  setSelectedFile: (file: StorageFile | null) => void;
  setFilePreviewUrl: (url: string | null) => void;
  setFilePreviewOpen: (open: boolean) => void;
}

export const useFileOperations = ({
  organizationId,
  currentPath,
  uploadFile,
  deleteFile,
  createDirectory,
  setSelectedFile,
  setFilePreviewUrl,
  setFilePreviewOpen
}: UseFileOperationsProps) => {
  const [showOperationStatus, setShowOperationStatus] = useState(false);

  const handleFileClick = (file: StorageFile) => {
    if (file.mimetype && file.mimetype.includes('folder')) {
      return { action: 'navigate', folderName: file.name };
    } else {
      setSelectedFile(file);
      previewFile(file);
      return { action: 'preview' };
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    const file = files[0];
    
    // Show operation status for large files
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setShowOperationStatus(true);
    }
    
    uploadFile({
      file,
      onProgress: (progress: number) => {
        console.log(`Upload progress: ${progress}%`);
      }
    });
  };

  const handleCreateFolder = (newFolderName: string) => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    
    createDirectory({ dirName: newFolderName });
  };

  const handleDeleteFile = (file: StorageFile, selectedFile: StorageFile | null) => {
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      deleteFile({ fileName: file.name }).then(() => {
        if (selectedFile?.id === file.id) {
          setSelectedFile(null);
          setFilePreviewUrl(null);
        }
      });
    }
  };

  const downloadFile = async (file: StorageFile) => {
    try {
      const blob = await fileStorageService.downloadFile(organizationId, currentPath, file.name);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('File download started');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const previewFile = async (file: StorageFile) => {
    if (
      file.mimetype?.startsWith('image/') || 
      file.mimetype?.startsWith('text/') || 
      file.mimetype?.includes('pdf') ||
      file.mimetype?.startsWith('video/') ||
      file.mimetype?.startsWith('audio/')
    ) {
      const url = await fileStorageService.getPreviewUrl(organizationId, currentPath, file.name);
      if (url) {
        setFilePreviewUrl(url);
        setFilePreviewOpen(true);
      }
    } else {
      toast.info('Preview not available for this file type');
    }
  };

  const markForOffline = async (file: StorageFile) => {
    try {
      await fileStorageService.markForOfflineAccess(organizationId, currentPath, file.name);
      toast.success('File marked for offline access');
    } catch (error) {
      toast.error('Failed to mark file for offline access');
    }
  };

  const removeOfflineAccess = async (file: StorageFile) => {
    try {
      await fileStorageService.removeOfflineAccess(organizationId, currentPath, file.name);
      toast.success('Offline access removed');
    } catch (error) {
      toast.error('Failed to remove offline access');
    }
  };

  return {
    handleFileClick,
    handleUpload,
    handleCreateFolder,
    handleDeleteFile,
    downloadFile,
    previewFile,
    markForOffline,
    removeOfflineAccess,
    showOperationStatus,
    setShowOperationStatus
  };
};
