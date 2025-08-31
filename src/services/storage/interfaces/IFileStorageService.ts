
export interface FileUploadOptions {
  onProgress?: (progress: number) => void;
  chunkSize?: number;
  metadata?: Record<string, unknown>;
  overwrite?: boolean;
}

export interface FileDownloadOptions {
  quality?: 'original' | 'compressed';
  format?: string;
}

export interface FilePreviewOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export interface StorageFile {
  id: string;
  name: string;
  size: number;
  mimetype: string;
  created_at: string;
  updated_at: string;
  path: string;
  metadata?: Record<string, unknown>;
  chunks?: number;
  isOfflineAvailable?: boolean;
}

export interface FileOperation {
  id: string;
  type: 'upload' | 'download' | 'delete' | 'sync';
  file: StorageFile;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'offline-queued';
  error?: string;
  createdAt: Date;
}

export interface IFileStorageService {
  // Basic file operations
  uploadFile(organizationId: string, path: string, file: File, options?: FileUploadOptions): Promise<StorageFile>;
  downloadFile(organizationId: string, path: string, fileName: string, options?: FileDownloadOptions): Promise<Blob>;
  deleteFile(organizationId: string, path: string, fileName: string): Promise<boolean>;
  listFiles(organizationId: string, path?: string): Promise<StorageFile[]>;
  
  // File URLs and previews
  getFileUrl(organizationId: string, path: string, fileName: string): Promise<string | null>;
  getPreviewUrl(organizationId: string, path: string, fileName: string, options?: FilePreviewOptions): Promise<string | null>;
  
  // Directory operations
  createDirectory(organizationId: string, path: string, dirName: string): Promise<boolean>;
  deleteDirectory(organizationId: string, path: string, dirName: string): Promise<boolean>;
  
  // Chunked upload support
  initiateChunkedUpload(organizationId: string, path: string, fileName: string, fileSize: number): Promise<string>;
  uploadChunk(uploadId: string, chunkIndex: number, chunk: Blob): Promise<boolean>;
  completeChunkedUpload(uploadId: string): Promise<StorageFile>;
  abortChunkedUpload(uploadId: string): Promise<boolean>;
  
  // Offline and sync capabilities
  markForOfflineAccess(organizationId: string, path: string, fileName: string): Promise<boolean>;
  removeOfflineAccess(organizationId: string, path: string, fileName: string): Promise<boolean>;
  syncOfflineChanges(): Promise<FileOperation[]>;
  getOfflineFiles(): Promise<StorageFile[]>;
  
  // Operation tracking
  getActiveOperations(): FileOperation[];
  cancelOperation(operationId: string): Promise<boolean>;
}
