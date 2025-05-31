
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  Download, 
  Trash2, 
  RefreshCw, 
  X, 
  CheckCircle, 
  AlertCircle,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import { FileOperation } from '@/services/storage/interfaces/IFileStorageService';
import { fileStorageService } from '@/services/storage/FileStorageService';
import { toast } from 'sonner';

interface FileOperationStatusProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileOperationStatus: React.FC<FileOperationStatusProps> = ({
  isOpen,
  onClose
}) => {
  const [operations, setOperations] = useState<FileOperation[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Initial load
    setOperations(fileStorageService.getActiveOperations());
    setIsOffline(fileStorageService.isOffline());

    // Subscribe to operation changes
    const unsubscribe = fileStorageService.onOperationsChange((newOperations) => {
      setOperations(newOperations);
    });

    // Monitor online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOpen]);

  const handleCancelOperation = async (operationId: string) => {
    try {
      await fileStorageService.cancelOperation(operationId);
      toast.success('Operation cancelled');
    } catch (error) {
      toast.error('Failed to cancel operation');
    }
  };

  const handleRetryOperation = async (operation: FileOperation) => {
    try {
      // Retry logic would depend on the operation type
      toast.info('Retrying operation...');
    } catch (error) {
      toast.error('Failed to retry operation');
    }
  };

  const handleSyncOfflineChanges = async () => {
    try {
      const results = await fileStorageService.syncOfflineChanges();
      const successful = results.filter(op => op.status === 'completed').length;
      const failed = results.filter(op => op.status === 'failed').length;
      
      if (successful > 0) {
        toast.success(`Successfully synced ${successful} operations`);
      }
      if (failed > 0) {
        toast.error(`Failed to sync ${failed} operations`);
      }
    } catch (error) {
      toast.error('Failed to sync offline changes');
    }
  };

  const getOperationIcon = (type: FileOperation['type']) => {
    switch (type) {
      case 'upload':
        return <Upload className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'sync':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: FileOperation['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'offline-queued':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: FileOperation['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3" />;
      case 'in-progress':
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const pendingOperations = operations.filter(op => 
    op.status === 'pending' || op.status === 'in-progress'
  );
  const queuedOperations = operations.filter(op => 
    op.status === 'offline-queued'
  );
  const recentOperations = operations.filter(op => 
    op.status === 'completed' || op.status === 'failed'
  ).slice(0, 10);

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[600px] shadow-lg z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            File Operations
            {isOffline ? (
              <WifiOff className="h-4 w-4 text-orange-500" />
            ) : (
              <Wifi className="h-4 w-4 text-green-500" />
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {isOffline && queuedOperations.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className="text-orange-600">
              {queuedOperations.length} queued for sync
            </Badge>
            <Button size="sm" variant="outline" onClick={handleSyncOfflineChanges}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync Now
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {pendingOperations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Active Operations</h4>
            <div className="space-y-2">
              {pendingOperations.map((operation) => (
                <div key={operation.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getOperationIcon(operation.type)}
                      <span className="text-sm font-medium truncate">
                        {operation.file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleCancelOperation(operation.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Progress value={operation.progress} className="mb-2" />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{operation.progress}%</span>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(operation.status)}
                    >
                      {getStatusIcon(operation.status)}
                      <span className="ml-1">{operation.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {queuedOperations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Queued for Sync</h4>
            <ScrollArea className="max-h-32">
              <div className="space-y-1">
                {queuedOperations.map((operation) => (
                  <div key={operation.id} className="flex items-center gap-2 p-2 rounded border">
                    {getOperationIcon(operation.type)}
                    <span className="text-sm truncate flex-1">
                      {operation.file.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Offline
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {recentOperations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Operations</h4>
            <ScrollArea className="max-h-40">
              <div className="space-y-1">
                {recentOperations.map((operation) => (
                  <div 
                    key={operation.id} 
                    className="flex items-center gap-2 p-2 rounded border"
                  >
                    {getOperationIcon(operation.type)}
                    <span className="text-sm truncate flex-1">
                      {operation.file.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {operation.status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRetryOperation(operation)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(operation.status)}`}
                      >
                        {getStatusIcon(operation.status)}
                        <span className="ml-1">{operation.status}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {operations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No active operations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
