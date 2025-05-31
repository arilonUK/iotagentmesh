
import { IFileStorageService } from './interfaces/IFileStorageService';
import { SupabaseStorageAdapter } from './adapters/SupabaseStorageAdapter';

class FileStorageService {
  private adapter: IFileStorageService;
  private offlineMode: boolean = false;

  constructor() {
    // Initialize with Supabase adapter by default
    this.adapter = new SupabaseStorageAdapter();
    
    // Monitor online/offline status
    this.setupOfflineDetection();
  }

  private setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.offlineMode = false;
      this.syncWhenOnline();
    });
    
    window.addEventListener('offline', () => {
      this.offlineMode = true;
    });
    
    this.offlineMode = !navigator.onLine;
  }

  private async syncWhenOnline(): Promise<void> {
    if (!this.offlineMode && this.adapter) {
      try {
        await this.adapter.syncOfflineChanges();
      } catch (error) {
        console.error('Error syncing offline changes:', error);
      }
    }
  }

  // Delegate all methods to the current adapter
  async uploadFile(...args: Parameters<IFileStorageService['uploadFile']>) {
    return this.adapter.uploadFile(...args);
  }

  async downloadFile(...args: Parameters<IFileStorageService['downloadFile']>) {
    return this.adapter.downloadFile(...args);
  }

  async deleteFile(...args: Parameters<IFileStorageService['deleteFile']>) {
    return this.adapter.deleteFile(...args);
  }

  async listFiles(...args: Parameters<IFileStorageService['listFiles']>) {
    return this.adapter.listFiles(...args);
  }

  async getFileUrl(...args: Parameters<IFileStorageService['getFileUrl']>) {
    return this.adapter.getFileUrl(...args);
  }

  async getPreviewUrl(...args: Parameters<IFileStorageService['getPreviewUrl']>) {
    return this.adapter.getPreviewUrl(...args);
  }

  async createDirectory(...args: Parameters<IFileStorageService['createDirectory']>) {
    return this.adapter.createDirectory(...args);
  }

  async deleteDirectory(...args: Parameters<IFileStorageService['deleteDirectory']>) {
    return this.adapter.deleteDirectory(...args);
  }

  async initiateChunkedUpload(...args: Parameters<IFileStorageService['initiateChunkedUpload']>) {
    return this.adapter.initiateChunkedUpload(...args);
  }

  async uploadChunk(...args: Parameters<IFileStorageService['uploadChunk']>) {
    return this.adapter.uploadChunk(...args);
  }

  async completeChunkedUpload(...args: Parameters<IFileStorageService['completeChunkedUpload']>) {
    return this.adapter.completeChunkedUpload(...args);
  }

  async abortChunkedUpload(...args: Parameters<IFileStorageService['abortChunkedUpload']>) {
    return this.adapter.abortChunkedUpload(...args);
  }

  async markForOfflineAccess(...args: Parameters<IFileStorageService['markForOfflineAccess']>) {
    return this.adapter.markForOfflineAccess(...args);
  }

  async removeOfflineAccess(...args: Parameters<IFileStorageService['removeOfflineAccess']>) {
    return this.adapter.removeOfflineAccess(...args);
  }

  async syncOfflineChanges(...args: Parameters<IFileStorageService['syncOfflineChanges']>) {
    return this.adapter.syncOfflineChanges(...args);
  }

  async getOfflineFiles(...args: Parameters<IFileStorageService['getOfflineFiles']>) {
    return this.adapter.getOfflineFiles(...args);
  }

  getActiveOperations(...args: Parameters<IFileStorageService['getActiveOperations']>) {
    return this.adapter.getActiveOperations(...args);
  }

  async cancelOperation(...args: Parameters<IFileStorageService['cancelOperation']>) {
    return this.adapter.cancelOperation(...args);
  }

  // Additional utility methods
  isOffline(): boolean {
    return this.offlineMode;
  }

  switchAdapter(adapter: IFileStorageService): void {
    this.adapter = adapter;
  }

  onOperationsChange(listener: (operations: any[]) => void): () => void {
    if ('onOperationsChange' in this.adapter && typeof this.adapter.onOperationsChange === 'function') {
      return this.adapter.onOperationsChange(listener);
    }
    return () => {};
  }
}

// Export singleton instance
export const fileStorageService = new FileStorageService();
export { FileStorageService };
