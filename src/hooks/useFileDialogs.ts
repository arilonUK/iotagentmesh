
import { useState } from 'react';
import { StorageFile } from '@/services/storage';

export const useFileDialogs = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);

  const resetUploadDialog = () => {
    setUploadDialogOpen(false);
  };

  const resetFolderDialog = () => {
    setNewFolderName('');
    setNewFolderDialogOpen(false);
  };

  return {
    uploadDialogOpen,
    setUploadDialogOpen,
    newFolderDialogOpen,
    setNewFolderDialogOpen,
    newFolderName,
    setNewFolderName,
    selectedFile,
    setSelectedFile,
    filePreviewUrl,
    setFilePreviewUrl,
    filePreviewOpen,
    setFilePreviewOpen,
    resetUploadDialog,
    resetFolderDialog
  };
};
