
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export const organizationSetupService = {
  setupDefaultPermissions: async (organizationId: string) => {
    try {
      console.log('Setting up default permissions for organization:', organizationId);
      
      const defaultPermissions = [
        { name: 'create_device', description: 'Can create devices' },
        { name: 'edit_device', description: 'Can edit devices' },
        { name: 'delete_device', description: 'Can delete devices' },
        { name: 'view_analytics', description: 'Can view analytics' },
        { name: 'manage_users', description: 'Can manage users' },
        { name: 'invite_users', description: 'Can invite users to the organization' },
        { name: 'manage_organization', description: 'Can manage organization settings' }
      ];
      
      for (const permission of defaultPermissions) {
        const { data: existingPerm } = await supabase
          .from('permissions')
          .select('id')
          .eq('name', permission.name)
          .maybeSingle();
          
        if (existingPerm?.id) {
          await assignPermissionToRole(organizationId, existingPerm.id, 'owner');
        } else {
          const { data: newPerm, error: permError } = await supabase
            .from('permissions')
            .insert(permission)
            .select()
            .single();
            
          if (permError) {
            console.error('Error creating permission:', permError);
          } else if (newPerm) {
            await assignPermissionToRole(organizationId, newPerm.id, 'owner');
          }
        }
      }
      
      const adminPermissions = ['create_device', 'edit_device', 'delete_device', 'view_analytics', 'manage_users', 'invite_users'];
      await setupRolePermissions(organizationId, 'admin', adminPermissions);
      
      const memberPermissions = ['create_device', 'edit_device', 'view_analytics'];
      await setupRolePermissions(organizationId, 'member', memberPermissions);
      
      const viewerPermissions = ['view_analytics'];
      await setupRolePermissions(organizationId, 'viewer', viewerPermissions);
      
      console.log('Default permissions setup completed for organization:', organizationId);
    } catch (error) {
      console.error('Error setting up default permissions:', error);
    }
  }
};

// Helper function to assign a permission to a role
const assignPermissionToRole = async (organizationId: string, permissionId: string, role: Database['public']['Enums']['role_type']) => {
  const { error } = await supabase
    .from('role_permissions')
    .insert({
      organization_id: organizationId,
      permission_id: permissionId,
      role: role
    });
    
  if (error) {
    console.error(`Error assigning permission ${permissionId} to ${role}:`, error);
  }
};

// Helper function to setup permissions for specific roles
const setupRolePermissions = async (organizationId: string, role: Database['public']['Enums']['role_type'], permissionNames: string[]) => {
  for (const permName of permissionNames) {
    const { data: perm } = await supabase
      .from('permissions')
      .select('id')
      .eq('name', permName)
      .maybeSingle();
      
    if (perm?.id) {
      await assignPermissionToRole(organizationId, perm.id, role);
    }
  }
};
