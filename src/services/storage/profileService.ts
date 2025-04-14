
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileStorageProfile } from './types';

export const profileService = {
  getStorageProfiles: async (organizationId: string): Promise<FileStorageProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('file_storage_profiles')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (error) {
        console.error('Error fetching storage profiles:', error);
        toast.error('Failed to load storage profiles');
        return [];
      }
      
      return data as FileStorageProfile[];
    } catch (error) {
      console.error('Exception fetching storage profiles:', error);
      toast.error('Failed to load storage profiles');
      return [];
    }
  },
  
  getStorageProfile: async (profileId: string): Promise<FileStorageProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('file_storage_profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (error) {
        console.error('Error fetching storage profile:', error);
        toast.error('Failed to load storage profile');
        return null;
      }
      
      return data as FileStorageProfile;
    } catch (error) {
      console.error('Exception fetching storage profile:', error);
      toast.error('Failed to load storage profile');
      return null;
    }
  },
  
  createStorageProfile: async (profile: Omit<FileStorageProfile, 'id' | 'created_at' | 'updated_at'>): Promise<FileStorageProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('file_storage_profiles')
        .insert({
          ...profile,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating storage profile:', error);
        toast.error('Failed to create storage profile');
        return null;
      }
      
      toast.success('Storage profile created successfully');
      return data as FileStorageProfile;
    } catch (error) {
      console.error('Exception creating storage profile:', error);
      toast.error('Failed to create storage profile');
      return null;
    }
  },
  
  updateStorageProfile: async (id: string, updates: Partial<Omit<FileStorageProfile, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('file_storage_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating storage profile:', error);
        toast.error('Failed to update storage profile');
        return false;
      }
      
      toast.success('Storage profile updated successfully');
      return true;
    } catch (error) {
      console.error('Exception updating storage profile:', error);
      toast.error('Failed to update storage profile');
      return false;
    }
  },
  
  deleteStorageProfile: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('file_storage_profiles')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting storage profile:', error);
        toast.error('Failed to delete storage profile');
        return false;
      }
      
      toast.success('Storage profile deleted successfully');
      return true;
    } catch (error) {
      console.error('Exception deleting storage profile:', error);
      toast.error('Failed to delete storage profile');
      return false;
    }
  }
};
