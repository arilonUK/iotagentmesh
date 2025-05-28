
import { supabase } from '@/integrations/supabase/client';
import { DataBucketConfig, DataBucketFormData } from '@/types/dataBucket';
import { toast } from 'sonner';

interface SupabaseDataBucket {
  id: string;
  name: string;
  description: string | null;
  device_id: string;
  organization_id: string;
  storage_backend: string;
  reading_type: string;
  retention_days: number;
  sampling_interval: number | null;
  created_at: string;
  updated_at: string;
  enabled: boolean;
  s3_config: any | null;
}

/**
 * Fetch all data buckets for an organization
 */
export async function fetchDataBuckets(organizationId: string): Promise<DataBucketConfig[]> {
  try {
    console.log('Fetching data buckets for organization:', organizationId);
    
    const { data, error } = await supabase
      .from('data_buckets')
      .select('*')
      .eq('organization_id', organizationId);
    
    if (error) {
      console.error('Error fetching data buckets:', error);
      return [];
    }
    
    console.log('Fetched data buckets:', data);
    
    return (data as SupabaseDataBucket[]).map(bucket => ({
      id: bucket.id,
      name: bucket.name,
      description: bucket.description || undefined,
      deviceId: bucket.device_id,
      organizationId: bucket.organization_id,
      storageBackend: bucket.storage_backend as 'postgres' | 's3',
      readingType: bucket.reading_type,
      retentionDays: bucket.retention_days,
      samplingInterval: bucket.sampling_interval || undefined,
      createdAt: bucket.created_at,
      updatedAt: bucket.updated_at,
      enabled: bucket.enabled,
      s3Config: bucket.s3_config,
    }));
  } catch (error) {
    console.error('Error in fetchDataBuckets:', error);
    return [];
  }
}

/**
 * Create a new data bucket
 */
export async function createDataBucket(
  organizationId: string, 
  bucketData: DataBucketFormData
): Promise<DataBucketConfig | null> {
  try {
    console.log('Creating data bucket with:', { organizationId, bucketData });
    
    const insertData = {
      name: bucketData.name,
      description: bucketData.description || null,
      device_id: bucketData.deviceId,
      organization_id: organizationId,
      storage_backend: bucketData.storageBackend,
      reading_type: bucketData.readingType,
      retention_days: bucketData.retentionDays,
      sampling_interval: bucketData.samplingInterval || null,
      enabled: bucketData.enabled,
      s3_config: bucketData.s3Config || null,
    };
    
    console.log('Insert data:', insertData);

    const { error, data } = await supabase
      .from('data_buckets')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error creating data bucket:', error);
      toast.error(`Failed to create data bucket: ${error.message}`);
      return null;
    }

    console.log('Successfully created data bucket:', data);

    const bucket = data as SupabaseDataBucket;
    return {
      id: bucket.id,
      name: bucket.name,
      description: bucket.description || undefined,
      deviceId: bucket.device_id,
      organizationId: bucket.organization_id,
      storageBackend: bucket.storage_backend as 'postgres' | 's3',
      readingType: bucket.reading_type,
      retentionDays: bucket.retention_days,
      samplingInterval: bucket.sampling_interval || undefined,
      createdAt: bucket.created_at,
      updatedAt: bucket.updated_at,
      enabled: bucket.enabled,
      s3Config: bucket.s3_config,
    };
  } catch (error) {
    console.error('Error in createDataBucket:', error);
    toast.error('Failed to create data bucket');
    return null;
  }
}

/**
 * Update an existing data bucket
 */
export async function updateDataBucket(
  bucketId: string,
  bucketData: Partial<DataBucketFormData>
): Promise<boolean> {
  try {
    console.log('Updating data bucket:', bucketId, 'with data:', bucketData);
    
    const updateData: any = {};
    
    // Only include fields that are provided
    if (bucketData.name !== undefined) updateData.name = bucketData.name;
    if (bucketData.description !== undefined) updateData.description = bucketData.description;
    if (bucketData.deviceId !== undefined) updateData.device_id = bucketData.deviceId;
    if (bucketData.storageBackend !== undefined) updateData.storage_backend = bucketData.storageBackend;
    if (bucketData.readingType !== undefined) updateData.reading_type = bucketData.readingType;
    if (bucketData.retentionDays !== undefined) updateData.retention_days = bucketData.retentionDays;
    if (bucketData.samplingInterval !== undefined) updateData.sampling_interval = bucketData.samplingInterval;
    if (bucketData.enabled !== undefined) updateData.enabled = bucketData.enabled;
    if (bucketData.s3Config !== undefined) updateData.s3_config = bucketData.s3Config;
    
    console.log('Update data:', updateData);
    
    const { error } = await supabase
      .from('data_buckets')
      .update(updateData)
      .eq('id', bucketId);

    if (error) {
      console.error('Supabase error updating data bucket:', error);
      toast.error(`Failed to update data bucket: ${error.message}`);
      return false;
    }

    console.log('Successfully updated data bucket');
    toast.success('Data bucket updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateDataBucket:', error);
    toast.error('Failed to update data bucket');
    return false;
  }
}

/**
 * Delete a data bucket
 */
export async function deleteDataBucket(bucketId: string): Promise<boolean> {
  try {
    console.log('Deleting data bucket:', bucketId);
    
    const { error } = await supabase
      .from('data_buckets')
      .delete()
      .eq('id', bucketId);

    if (error) {
      console.error('Supabase error deleting data bucket:', error);
      toast.error(`Failed to delete data bucket: ${error.message}`);
      return false;
    }

    console.log('Successfully deleted data bucket');
    toast.success('Data bucket deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteDataBucket:', error);
    toast.error('Failed to delete data bucket');
    return false;
  }
}
