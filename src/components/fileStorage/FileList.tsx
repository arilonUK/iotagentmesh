
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Folder, File, MoreHorizontal, Download, Trash2, FileEdit } from 'lucide-react';
import { StorageFile } from '@/services/storage';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { formatFileSize } from '@/lib/utils';

interface FileListProps {
  files: StorageFile[];
  onFileClick: (file: StorageFile) => void;
  onPreview: (file: StorageFile) => void;
  onDownload: (file: StorageFile) => void;
  onDelete: (file: StorageFile) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onFileClick,
  onPreview,
  onDownload,
  onDelete,
}) => {
  return (
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
        {files.map((file) => (
          <TableRow key={file.id} className="cursor-pointer hover:bg-muted/60">
            <TableCell onClick={() => onFileClick(file)}>
              {file.mimetype === 'folder' ? (
                <Folder className="h-4 w-4" />
              ) : (
                <File className="h-4 w-4" />
              )}
            </TableCell>
            <TableCell onClick={() => onFileClick(file)}>{file.name}</TableCell>
            <TableCell onClick={() => onFileClick(file)}>
              {file.mimetype === 'folder' ? '--' : formatFileSize(file.size)}
            </TableCell>
            <TableCell onClick={() => onFileClick(file)}>
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
                      <DropdownMenuItem onClick={() => onPreview(file)}>
                        <FileEdit className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload(file)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
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
