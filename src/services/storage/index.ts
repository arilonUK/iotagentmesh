
export * from './interfaces/IFileStorageService';
export * from './adapters/BaseStorageAdapter';
export * from './adapters/SupabaseStorageAdapter';
export { fileStorageService, FileStorageService } from './FileStorageService';

// Export types but exclude StorageFile to avoid conflict
export type { FileStorageProfile } from './types';

// Legacy exports for backward compatibility
export { filesApiService as profileService } from '@/services/api/filesApiService';

// Update the file service export to use the new unified service
export { fileStorageService as fileService } from './FileStorageService';
