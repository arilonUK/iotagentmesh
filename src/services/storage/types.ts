
export type FileStorageProfile = {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  path: string;
  created_at: string;
  updated_at: string;
  public_read: boolean;
  index_file: string;
};

export type StorageFile = {
  id: string;
  name: string;
  size: number;
  mimetype: string;
  created_at: string;
  updated_at: string;
  lastModified?: number;
  path?: string;
};
