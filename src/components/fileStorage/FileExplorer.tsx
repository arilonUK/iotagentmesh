
import React, { useState } from 'react';
import { useStorageFiles } from '@/hooks/useFileStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Folder, File, Upload, PlusCircle, MoreHorizontal, Download, Trash2, 
  ArrowLeft, FileEdit, Search
} from 'lucide-react';
import { StorageFile } from '@/services/fileStorageService';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fileStorageService } from '@/services/fileStorageService';
import { toast } from 'sonner';

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
    refetch 
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
    const url = await fileStorageService.getFileUrl(organizationId, currentPath, file.name);
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
      const url = await fileStorageService.getFileUrl(organizationId, currentPath, file.name);
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
                <Input type="file" onChange={handleUpload} />
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
                <Button onClick={handleCreateFolder} disabled={createDirectory.isPending}>
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading files...</div>
      ) : filteredFiles.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file) => (
              <TableRow key={file.id} className="cursor-pointer hover:bg-muted/60">
                <TableCell onClick={() => handleFileClick(file)}>
                  {file.mimetype === 'folder' ? (
                    <Folder className="h-4 w-4" />
                  ) : (
                    <File className="h-4 w-4" />
                  )}
                </TableCell>
                <TableCell onClick={() => handleFileClick(file)}>{file.name}</TableCell>
                <TableCell onClick={() => handleFileClick(file)}>
                  {file.mimetype === 'folder' ? '--' : formatFileSize(file.size)}
                </TableCell>
                <TableCell onClick={() => handleFileClick(file)}>
                  {new Date(file.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {file.mimetype !== 'folder' && (
                        <>
                          <DropdownMenuItem onClick={() => previewFile(file)}>
                            <FileEdit className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadFile(file)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteFile(file)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          {searchQuery ? 'No files match your search' : 'This folder is empty'}
        </div>
      )}
      
      <Dialog open={filePreviewOpen} onOpenChange={setFilePreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          {filePreviewUrl && selectedFile?.mimetype && (
            <div className="overflow-auto max-h-[70vh]">
              {selectedFile.mimetype.startsWith('image/') ? (
                <img 
                  src={filePreviewUrl} 
                  alt={selectedFile.name} 
                  className="max-w-full" 
                />
              ) : selectedFile.mimetype === 'application/pdf' ? (
                <iframe 
                  src={filePreviewUrl} 
                  title={selectedFile.name} 
                  className="w-full h-[70vh]"
                />
              ) : selectedFile.mimetype.startsWith('text/') ? (
                <pre className="bg-muted p-4 rounded overflow-auto max-h-[70vh]">
                  {/* Fetch text content for display */}
                  <TextPreview url={filePreviewUrl} />
                </pre>
              ) : (
                <div className="text-center py-8">
                  Preview not available for this file type
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            {selectedFile && (
              <Button onClick={() => downloadFile(selectedFile)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component to fetch and display text content
const TextPreview: React.FC<{ url: string }> = ({ url }) => {
  const [text, setText] = useState<string>('Loading...');

  React.useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch(url);
        const content = await response.text();
        setText(content);
      } catch (error) {
        setText('Failed to load text content');
      }
    };
    
    fetchText();
  }, [url]);

  return <>{text}</>;
};

// Helper function to format file sizes
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default FileExplorer;
