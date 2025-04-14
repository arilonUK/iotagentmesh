
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FileActionsProps {
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

export const FileActions: React.FC<FileActionsProps> = ({
  currentPath,
  onUpload,
  onCreateFolder,
  uploadDialogOpen,
  setUploadDialogOpen,
  newFolderDialogOpen,
  setNewFolderDialogOpen,
  newFolderName,
  setNewFolderName,
}) => {
  return (
    <div className="flex gap-2">
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="file" onChange={onUpload} />
            <div className="text-sm text-muted-foreground">
              Current directory: {currentPath || 'Root'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input 
              placeholder="Folder name" 
              value={newFolderName} 
              onChange={(e) => setNewFolderName(e.target.value)} 
            />
            <Button onClick={onCreateFolder}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
