import { useNavigate } from 'react-router-dom';
import { AuthContextType } from './types';
import { authServices } from './authServices';
import { profileServices } from '@/services/profileServices';
import { useSessionManager } from './useSessionManager';
import { useOrganizationManager } from '@/hooks/useOrganizationManager';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const useAuthProvider = (): AuthContextType => {
  const navigate = useNavigate();
  const orgsLoaded = useRef(false);
  
  const {
    session,
    user,
    profile,
    loading,
    fetchProfile
  } = useSessionManager();

  const {
    organization,
    userRole,
    userOrganizations,
    switchOrganization,
    fetchOrganizationData,
    setUserOrganizations
  } = useOrganizationManager(user?.id);

  useEffect(() => {
    const loadUserOrganizations = async () => {
      if (user?.id && !orgsLoaded.current) {
        console.log('Loading user organizations for', user.id);
        try {
          const orgs = await profileServices.getUserOrganizations(user.id);
          console.log('User organizations loaded:', orgs);
          
          if (orgs && orgs.length > 0) {
            setUserOrganizations(orgs);
            orgsLoaded.current = true;
            
            if (profile?.default_organization_id) {
              console.log('Loading default organization:', profile.default_organization_id);
              await fetchOrganizationData(profile.default_organization_id, user.id);
            } else {
              const defaultOrg = orgs.find(org => org.is_default) || orgs[0];
              console.log('Using organization as default:', defaultOrg.id);
              await fetchOrganizationData(defaultOrg.id, user.id);
              
              if (!profile?.default_organization_id) {
                try {
                  await supabase
                    .from('profiles')
                    .update({ default_organization_id: defaultOrg.id })
                    .eq('id', user.id);
                  
                  console.log('Updated default organization to:', defaultOrg.id);
                } catch (updateError) {
                  console.error('Error updating default organization:', updateError);
                }
              }
            }
          } else {
            console.log('No organizations found for user, creating default organization');
            try {
              const orgName = user.email?.split('@')[0] + "'s Organization";
              const orgSlug = 'org-' + Math.random().toString(36).substring(2, 10);
              
              const { data: newOrg, error: orgError } = await supabase
                .from('organizations')
                .insert({
                  name: orgName,
                  slug: orgSlug
                })
                .select()
                .single();
                
              if (orgError) {
                console.error('Error creating default organization:', orgError);
                throw orgError;
              }
              
              console.log('Created default organization:', newOrg.id);
              
              const { error: memberError } = await supabase
                .from('organization_members')
                .insert({
                  organization_id: newOrg.id,
                  user_id: user.id,
                  role: 'owner'
                });
                
              if (memberError) {
                console.error('Error adding user to organization:', memberError);
                throw memberError;
              }
              
              console.log('User added as owner to organization:', newOrg.id);
              
              await setupDefaultPermissions(newOrg.id);
              
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ default_organization_id: newOrg.id })
                .eq('id', user.id);
                
              if (updateError) {
                console.error('Error updating default organization:', updateError);
              }
              
              const updatedOrgs = await profileServices.getUserOrganizations(user.id);
              if (updatedOrgs && updatedOrgs.length > 0) {
                setUserOrganizations(updatedOrgs);
                orgsLoaded.current = true;
                await fetchOrganizationData(newOrg.id, user.id);
                
                toast('Default organization created', {
                  style: { backgroundColor: 'green', color: 'white' }
                });
              }
            } catch (createError) {
              console.error('Error in organization creation flow:', createError);
              toast('Error setting up your organization', {
                style: { backgroundColor: 'red', color: 'white' }
              });
            }
          }
        } catch (error) {
          console.error('Error loading user organizations:', error);
          toast('Error loading your organizations', {
            style: { backgroundColor: 'red', color: 'white' }
          });
        }
      }
    };

    loadUserOrganizations();
  }, [user, profile]);

  useEffect(() => {
    if (!user) {
      orgsLoaded.current = false;
    }
  }, [user]);
  
  const setupDefaultPermissions = async (organizationId: string) => {
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
  };
  
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

  return {
    session,
    user,
    profile,
    organization,
    userRole,
    userOrganizations,
    loading,
    signUp: authServices.signUp,
    signIn: authServices.signIn,
    signOut: authServices.signOut,
    updateProfile: profileServices.updateProfile,
    switchOrganization
  };
};

import { Database } from '@/integrations/supabase/types';
