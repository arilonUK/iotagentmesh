export * from './types';
export { filesApiService as profileService } from '@/services/api/filesApiService';
export { filesApiService as fileService } from '@/services/api/filesApiService';

// Keep existing fileService for backward compatibility
export { fileService } from './fileService';
