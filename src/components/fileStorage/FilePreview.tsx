
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { StorageFile } from '@/services/storage';

interface FilePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: StorageFile | null;
  previewUrl: string | null;
  onDownload: (file: StorageFile) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  open,
  onOpenChange,
  file,
  previewUrl,
  onDownload,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{file?.name}</DialogTitle>
        </DialogHeader>
        {previewUrl && file?.mimetype && (
          <div className="overflow-auto max-h-[70vh]">
            {file.mimetype.startsWith('image/') ? (
              <img 
                src={previewUrl} 
                alt={file.name} 
                className="max-w-full" 
              />
            ) : file.mimetype === 'application/pdf' ? (
              <iframe 
                src={previewUrl} 
                title={file.name} 
                className="w-full h-[70vh]"
              />
            ) : file.mimetype.startsWith('text/') ? (
              <pre className="bg-muted p-4 rounded overflow-auto max-h-[70vh]">
                <TextPreview url={previewUrl} />
              </pre>
            ) : (
              <div className="text-center py-8">
                Preview not available for this file type
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2">
          {file && (
            <Button onClick={() => onDownload(file)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper component to fetch and display text content
const TextPreview: React.FC<{ url: string }> = ({ url }) => {
  const [text, setText] = React.useState<string>('Loading...');

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
