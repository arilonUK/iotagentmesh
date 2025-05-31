
import { useState } from 'react';
import { StorageFile } from '@/services/storage';
import { fileService } from '@/services/storage';
import { toast } from 'sonner';

interface UseFileOperationsProps {
  organizationId: string;
  currentPath: string;
  uploadFile: any;
  deleteFile: any;
  createDirectory: any;
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
    uploadFile.mutate(
      { file }, 
      {
        onSuccess: () => {
          return { success: true };
        }
      }
    );
  };

  const handleCreateFolder = (newFolderName: string) => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    
    createDirectory.mutate(
      { dirName: newFolderName },
      {
        onSuccess: () => {
          return { success: true };
        }
      }
    );
  };

  const handleDeleteFile = (file: StorageFile, selectedFile: StorageFile | null) => {
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

  return {
    handleFileClick,
    handleUpload,
    handleCreateFolder,
    handleDeleteFile,
    downloadFile,
    previewFile
  };
};
