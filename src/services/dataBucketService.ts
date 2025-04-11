
import { supabase } from '@/integrations/supabase/client';
import { DataBucketConfig, DataBucketFormData } from '@/types/dataBucket';
import { toast } from 'sonner';

/**
 * Fetch all data buckets for an organization
 */
export async function fetchDataBuckets(organizationId: string): Promise<DataBucketConfig[]> {
  try {
    const { data, error } = await supabase
      .from('data_buckets')
      .select('*')
      .eq('organization_id', organizationId);
    
    if (error) {
      console.error('Error fetching data buckets:', error);
      return [];
    }
    
    return data.map(bucket => ({
      id: bucket.id,
      name: bucket.name,
      description: bucket.description,
      deviceId: bucket.device_id,
      organizationId: bucket.organization_id,
      storageBackend: bucket.storage_backend,
      readingType: bucket.reading_type,
      retentionDays: bucket.retention_days,
      samplingInterval: bucket.sampling_interval,
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
    const { error, data } = await supabase
      .from('data_buckets')
      .insert({
        name: bucketData.name,
        description: bucketData.description,
        device_id: bucketData.deviceId,
        organization_id: organizationId,
        storage_backend: bucketData.storageBackend,
        reading_type: bucketData.readingType,
        retention_days: bucketData.retentionDays,
        sampling_interval: bucketData.samplingInterval,
        enabled: bucketData.enabled,
        s3_config: bucketData.s3Config,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating data bucket:', error);
      toast.error('Failed to create data bucket');
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      deviceId: data.device_id,
      organizationId: data.organization_id,
      storageBackend: data.storage_backend,
      readingType: data.reading_type,
      retentionDays: data.retention_days,
      samplingInterval: data.sampling_interval,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      enabled: data.enabled,
      s3Config: data.s3_config,
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
    
    const { error } = await supabase
      .from('data_buckets')
      .update(updateData)
      .eq('id', bucketId);

    if (error) {
      console.error('Error updating data bucket:', error);
      toast.error('Failed to update data bucket');
      return false;
    }

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
    const { error } = await supabase
      .from('data_buckets')
      .delete()
      .eq('id', bucketId);

    if (error) {
      console.error('Error deleting data bucket:', error);
      toast.error('Failed to delete data bucket');
      return false;
    }

    toast.success('Data bucket deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteDataBucket:', error);
    toast.error('Failed to delete data bucket');
    return false;
  }
}
