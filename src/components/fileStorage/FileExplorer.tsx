
import React, { useState } from 'react';
import { useStorageFiles } from '@/hooks/useFileStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import { StorageFile } from '@/services/storage';
import { fileService } from '@/services/storage';
import { toast } from 'sonner';
import { FileList } from './FileList';
import { FileActions } from './FileActions';
import { FilePreview } from './FilePreview';

interface FileExplorerProps {
  organizationId: string;
  initialPath?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center flex-1">
          <Button 
            variant="outline" 
            size="icon"
            onClick={navigateUp}
            disabled={!currentPath}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="bg-muted px-3 py-2 rounded-md flex-1 overflow-x-auto whitespace-nowrap">
            {currentPath || 'Root'}
          </div>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : `${filteredFiles.length} item${filteredFiles.length !== 1 ? 's' : ''}`}
        </div>
        <FileActions 
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
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading files...</div>
      ) : filteredFiles.length > 0 ? (
        <FileList
          files={filteredFiles}
          onFileClick={handleFileClick}
          onPreview={previewFile}
          onDownload={downloadFile}
          onDelete={handleDeleteFile}
        />
      ) : (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          {searchQuery ? 'No files match your search' : 'This folder is empty'}
        </div>
      )}
      
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

export default FileExplorer;
