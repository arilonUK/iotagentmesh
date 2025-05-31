
import { IFileStorageService, StorageFile, FileUploadOptions, FileDownloadOptions, FilePreviewOptions, FileOperation } from '../interfaces/IFileStorageService';

export abstract class BaseStorageAdapter implements IFileStorageService {
  protected activeOperations: Map<string, FileOperation> = new Map();
  protected operationListeners: ((operations: FileOperation[]) => void)[] = [];

  abstract uploadFile(organizationId: string, path: string, file: File, options?: FileUploadOptions): Promise<StorageFile>;
  abstract downloadFile(organizationId: string, path: string, fileName: string, options?: FileDownloadOptions): Promise<Blob>;
  abstract deleteFile(organizationId: string, path: string, fileName: string): Promise<boolean>;
  abstract listFiles(organizationId: string, path?: string): Promise<StorageFile[]>;
  abstract getFileUrl(organizationId: string, path: string, fileName: string): Promise<string | null>;
  abstract createDirectory(organizationId: string, path: string, dirName: string): Promise<boolean>;
  abstract deleteDirectory(organizationId: string, path: string, dirName: string): Promise<boolean>;

  // Default implementations for chunked uploads (can be overridden)
  async initiateChunkedUpload(organizationId: string, path: string, fileName: string, fileSize: number): Promise<string> {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return uploadId;
  }

  async uploadChunk(uploadId: string, chunkIndex: number, chunk: Blob): Promise<boolean> {
    // Default implementation - fallback to regular upload
    throw new Error('Chunked upload not implemented in this adapter');
  }

  async completeChunkedUpload(uploadId: string): Promise<StorageFile> {
    throw new Error('Chunked upload completion not implemented in this adapter');
  }

  async abortChunkedUpload(uploadId: string): Promise<boolean> {
    return true;
  }

  // Default preview URL implementation
  async getPreviewUrl(organizationId: string, path: string, fileName: string, options?: FilePreviewOptions): Promise<string | null> {
    return this.getFileUrl(organizationId, path, fileName);
  }

  // Offline capabilities (base implementation)
  async markForOfflineAccess(organizationId: string, path: string, fileName: string): Promise<boolean> {
    const files = await this.getOfflineFiles();
    const file = files.find(f => f.path === `${path}/${fileName}`);
    if (file) {
      file.isOfflineAvailable = true;
      localStorage.setItem('offline_files', JSON.stringify(files));
    }
    return true;
  }

  async removeOfflineAccess(organizationId: string, path: string, fileName: string): Promise<boolean> {
    const files = await this.getOfflineFiles();
    const updatedFiles = files.filter(f => f.path !== `${path}/${fileName}`);
    localStorage.setItem('offline_files', JSON.stringify(updatedFiles));
    return true;
  }

  async syncOfflineChanges(): Promise<FileOperation[]> {
    const offlineOperations = this.getOfflineOperations();
    const syncResults: FileOperation[] = [];
    
    for (const operation of offlineOperations) {
      try {
        const updatedOperation = { ...operation, status: 'in-progress' as const };
        this.updateOperation(updatedOperation);
        
        // Process the operation based on type
        switch (operation.type) {
          case 'upload':
            // Re-attempt upload
            break;
          case 'delete':
            // Re-attempt delete
            break;
        }
        
        const completedOperation = { ...updatedOperation, status: 'completed' as const };
        this.updateOperation(completedOperation);
        syncResults.push(completedOperation);
      } catch (error) {
        const failedOperation = { 
          ...operation, 
          status: 'failed' as const, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        this.updateOperation(failedOperation);
        syncResults.push(failedOperation);
      }
    }
    
    return syncResults;
  }

  async getOfflineFiles(): Promise<StorageFile[]> {
    const stored = localStorage.getItem('offline_files');
    return stored ? JSON.parse(stored) : [];
  }

  getActiveOperations(): FileOperation[] {
    return Array.from(this.activeOperations.values());
  }

  async cancelOperation(operationId: string): Promise<boolean> {
    const operation = this.activeOperations.get(operationId);
    if (operation) {
      operation.status = 'failed';
      operation.error = 'Cancelled by user';
      this.updateOperation(operation);
      return true;
    }
    return false;
  }

  protected createOperation(type: FileOperation['type'], file: StorageFile): FileOperation {
    const operation: FileOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      file,
      progress: 0,
      status: 'pending',
      createdAt: new Date()
    };
    
    this.activeOperations.set(operation.id, operation);
    this.notifyOperationListeners();
    return operation;
  }

  protected updateOperation(operation: FileOperation): void {
    this.activeOperations.set(operation.id, operation);
    this.notifyOperationListeners();
    
    if (operation.status === 'completed' || operation.status === 'failed') {
      setTimeout(() => {
        this.activeOperations.delete(operation.id);
        this.notifyOperationListeners();
      }, 5000); // Remove completed operations after 5 seconds
    }
  }

  protected notifyOperationListeners(): void {
    const operations = this.getActiveOperations();
    this.operationListeners.forEach(listener => listener(operations));
  }

  protected getOfflineOperations(): FileOperation[] {
    return this.getActiveOperations().filter(op => op.status === 'offline-queued');
  }

  onOperationsChange(listener: (operations: FileOperation[]) => void): () => void {
    this.operationListeners.push(listener);
    return () => {
      const index = this.operationListeners.indexOf(listener);
      if (index > -1) {
        this.operationListeners.splice(index, 1);
      }
    };
  }
}
