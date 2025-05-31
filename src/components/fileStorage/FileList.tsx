
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Folder, File, MoreHorizontal, Download, Trash2, FileEdit, Wifi, WifiOff } from 'lucide-react';
import { StorageFile } from '@/services/storage/interfaces/IFileStorageService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { formatFileSize } from '@/lib/utils';

interface FileListProps {
  files: StorageFile[];
  onFileClick: (file: StorageFile) => void;
  onPreview: (file: StorageFile) => void;
  onDownload: (file: StorageFile) => void;
  onDelete: (file: StorageFile) => void;
  onMarkOffline?: (file: StorageFile) => void;
  onRemoveOffline?: (file: StorageFile) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onFileClick,
  onPreview,
  onDownload,
  onDelete,
  onMarkOffline,
  onRemoveOffline
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8"></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Last Modified</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-8"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.id} className="cursor-pointer hover:bg-muted/60">
            <TableCell onClick={() => onFileClick(file)}>
              {file.mimetype === 'folder' ? (
                <Folder className="h-4 w-4" />
              ) : (
                <File className="h-4 w-4" />
              )}
            </TableCell>
            <TableCell onClick={() => onFileClick(file)} className="font-medium">
              {file.name}
              {file.chunks && file.chunks > 1 && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {file.chunks} chunks
                </Badge>
              )}
            </TableCell>
            <TableCell onClick={() => onFileClick(file)}>
              {file.mimetype === 'folder' ? '--' : formatFileSize(file.size)}
            </TableCell>
            <TableCell onClick={() => onFileClick(file)}>
              {new Date(file.created_at).toLocaleString()}
            </TableCell>
            <TableCell onClick={() => onFileClick(file)}>
              {file.isOfflineAvailable && (
                <Badge variant="outline" className="text-green-600">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
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
                      <DropdownMenuItem onClick={() => onPreview(file)}>
                        <FileEdit className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload(file)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      {file.isOfflineAvailable ? (
                        onRemoveOffline && (
                          <DropdownMenuItem onClick={() => onRemoveOffline(file)}>
                            <Wifi className="h-4 w-4 mr-2" />
                            Remove Offline Access
                          </DropdownMenuItem>
                        )
                      ) : (
                        onMarkOffline && (
                          <DropdownMenuItem onClick={() => onMarkOffline(file)}>
                            <WifiOff className="h-4 w-4 mr-2" />
                            Make Available Offline
                          </DropdownMenuItem>
                        )
                      )}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDelete(file)}
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
  );
};
