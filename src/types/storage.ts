export interface FileStorageProfile {
  id: string;
  name: string;
  description?: string;
  path: string;
  public_read: boolean;
  index_file: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}