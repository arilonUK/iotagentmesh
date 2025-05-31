
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, X, ZoomIn, ZoomOut, RotateCw, Share, Heart } from 'lucide-react';
import { StorageFile } from '@/services/storage/interfaces/IFileStorageService';
import { fileStorageService } from '@/services/storage/FileStorageService';
import { toast } from 'sonner';

interface FilePreviewSystemProps {
  file: StorageFile | null;
  organizationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewSystem: React.FC<FilePreviewSystemProps> = ({
  file,
  organizationId,
  isOpen,
  onClose
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    if (file && isOpen) {
      loadPreview();
    } else {
      setPreviewUrl(null);
      setTextContent(null);
      setZoom(100);
      setRotation(0);
    }
  }, [file, isOpen]);

  const loadPreview = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const path = file.path.split('/').slice(1, -1).join('/');
      const url = await fileStorageService.getPreviewUrl(organizationId, path, file.name, {
        width: 1200,
        height: 800,
        quality: 85
      });
      
      if (url) {
        setPreviewUrl(url);
        
        // For text files, fetch content
        if (file.mimetype.startsWith('text/') || file.mimetype === 'application/json') {
          try {
            const response = await fetch(url);
            const content = await response.text();
            setTextContent(content);
          } catch (error) {
            console.error('Error loading text content:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load file preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    
    try {
      const link = document.createElement('a');
      link.href = previewUrl || '';
      link.download = file.name;
      link.click();
      toast.success('File download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleShare = async () => {
    if (!previewUrl) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: file?.name,
          url: previewUrl
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(previewUrl);
        toast.success('File URL copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy URL to clipboard');
      }
    }
  };

  const renderPreviewContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!file || !previewUrl) {
      return (
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          No preview available
        </div>
      );
    }

    if (file.mimetype.startsWith('image/')) {
      return (
        <div className="flex justify-center overflow-auto max-h-[70vh]">
          <img
            src={previewUrl}
            alt={file.name}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
            className="max-w-full h-auto"
          />
        </div>
      );
    }

    if (file.mimetype === 'application/pdf') {
      return (
        <iframe
          src={previewUrl}
          title={file.name}
          className="w-full h-[70vh] border-0"
        />
      );
    }

    if (file.mimetype.startsWith('video/')) {
      return (
        <video
          controls
          src={previewUrl}
          className="w-full max-h-[70vh]"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          Your browser does not support the video element.
        </video>
      );
    }

    if (file.mimetype.startsWith('audio/')) {
      return (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="text-6xl">🎵</div>
          <audio controls src={previewUrl} className="w-full max-w-md">
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    if (textContent !== null) {
      return (
        <ScrollArea className="h-[70vh] w-full">
          <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap">
            {textContent}
          </pre>
        </ScrollArea>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-6xl">📄</div>
        <p className="text-muted-foreground">Preview not available for this file type</p>
        <Button onClick={handleDownload} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download to view
        </Button>
      </div>
    );
  };

  const canZoom = file?.mimetype.startsWith('image/') || file?.mimetype.startsWith('video/');
  const canRotate = file?.mimetype.startsWith('image/');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DialogTitle className="truncate">{file?.name}</DialogTitle>
              {file && (
                <Badge variant="secondary" className="text-xs">
                  {file.mimetype}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {canZoom && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom(Math.max(25, zoom - 25))}
                    disabled={zoom <= 25}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground w-12 text-center">
                    {zoom}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom(Math.min(400, zoom + 25))}
                    disabled={zoom >= 400}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {canRotate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRotation((rotation + 90) % 360)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}
              
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {renderPreviewContent()}
        </div>
        
        {file && (
          <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
              <span>Modified: {new Date(file.updated_at).toLocaleDateString()}</span>
            </div>
            
            {canZoom && zoom !== 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(100)}
              >
                Reset Zoom
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
