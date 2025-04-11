
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from './types';
import { authServices } from './authServices';
import { profileServices } from './profileServices';
import { useSessionManager } from './useSessionManager';
import { useOrganizationManager } from './useOrganizationManager';
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

  // Track if organizations have been loaded to prevent multiple fetches
  useEffect(() => {
    const loadUserOrganizations = async () => {
      if (user?.id && !orgsLoaded.current) {
        console.log('Loading user organizations for', user.id);
        try {
          // Fetch user's organizations
          const orgs = await profileServices.getUserOrganizations(user.id);
          console.log('User organizations loaded:', orgs);
          
          if (orgs && orgs.length > 0) {
            setUserOrganizations(orgs);
            orgsLoaded.current = true;
            
            // Fetch default organization data if it exists
            if (profile?.default_organization_id) {
              console.log('Loading default organization:', profile.default_organization_id);
              await fetchOrganizationData(profile.default_organization_id, user.id);
            } else {
              // Use the first organization as default if no default is set
              const defaultOrg = orgs.find(org => org.is_default) || orgs[0];
              console.log('Using organization as default:', defaultOrg.id);
              await fetchOrganizationData(defaultOrg.id, user.id);
              
              // Update the user's profile to set this as default if not already set
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
            // Create a default organization for the user
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
              
              // Add the user as an owner of the organization
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
              
              // Set up default permissions for organization roles
              await setupDefaultPermissions(newOrg.id);
              
              // Set the organization as the default for the user
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ default_organization_id: newOrg.id })
                .eq('id', user.id);
                
              if (updateError) {
                console.error('Error updating default organization:', updateError);
              }
              
              // Refresh user organizations
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

  // Reset organization data when user logs out
  useEffect(() => {
    if (!user) {
      orgsLoaded.current = false;
    }
  }, [user]);
  
  // Setup default permissions for a newly created organization
  const setupDefaultPermissions = async (organizationId: string) => {
    try {
      console.log('Setting up default permissions for organization:', organizationId);
      
      // First, ensure all basic permissions exist
      const defaultPermissions = [
        { name: 'create_device', description: 'Can create devices' },
        { name: 'edit_device', description: 'Can edit devices' },
        { name: 'delete_device', description: 'Can delete devices' },
        { name: 'view_analytics', description: 'Can view analytics' },
        { name: 'manage_users', description: 'Can manage users' },
        { name: 'invite_users', description: 'Can invite users to the organization' },
        { name: 'manage_organization', description: 'Can manage organization settings' }
      ];
      
      // Insert permissions one by one and collect their IDs
      for (const permission of defaultPermissions) {
        const { data: existingPerm } = await supabase
          .from('permissions')
          .select('id')
          .eq('name', permission.name)
          .maybeSingle();
          
        // If permission exists, assign it to the owner role
        if (existingPerm?.id) {
          await assignPermissionToRole(organizationId, existingPerm.id, 'owner');
        } else {
          // If permission doesn't exist, create it and then assign
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
      
      // Setup admin role with slightly reduced permissions
      const adminPermissions = ['create_device', 'edit_device', 'delete_device', 'view_analytics', 'manage_users', 'invite_users'];
      await setupRolePermissions(organizationId, 'admin', adminPermissions);
      
      // Setup member role with basic permissions
      const memberPermissions = ['create_device', 'edit_device', 'view_analytics'];
      await setupRolePermissions(organizationId, 'member', memberPermissions);
      
      // Setup viewer role with view-only permissions
      const viewerPermissions = ['view_analytics'];
      await setupRolePermissions(organizationId, 'viewer', viewerPermissions);
      
      console.log('Default permissions setup completed for organization:', organizationId);
    } catch (error) {
      console.error('Error setting up default permissions:', error);
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

// Import the Database type from Supabase
import { Database } from '@/integrations/supabase/types';
