
export type StorageBackend = 'postgres' | 's3';

export interface DataBucketConfig {
  id: string;
  name: string;
  description?: string;
  deviceId: string;
  organizationId: string;
  storageBackend: StorageBackend;
  readingType: string; // e.g., "temperature", "humidity"
  retentionDays: number;
  samplingInterval?: number; // in seconds, optional for downsampling
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
  s3Config?: {
    bucketName: string;
    region: string;
    path?: string;
  };
}

export type DataBucketFormData = Omit<DataBucketConfig, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>;
