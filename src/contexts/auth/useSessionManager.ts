
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';
import { profileServices } from './profileServices';
import { Database } from '@/integrations/supabase/types';

export type SessionManagerReturn = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
};

// Define a type for role that matches the expected enum values
type RoleType = Database['public']['Enums']['role_type'];

export const useSessionManager = (): SessionManagerReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        } else if (event === 'SIGNED_IN' && newSession?.user) {
          // Use setTimeout to prevent supabase deadlock
          setTimeout(() => {
            fetchProfile(newSession.user.id);
          }, 0);
        }
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no rows case

      if (profileError && profileError.code !== 'PGRST116') {
        // Log other errors but not the "no rows returned" error
        console.error('Error fetching profile:', profileError);
      }
      
      if (profileData) {
        console.log('Profile found:', profileData);
        setProfile(profileData);
      } else {
        console.log('No profile found for user, creating a new one');
        // Create a default profile for the user
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            // Create a default organization for the user if they don't have one
            const { data: newOrg, error: orgError } = await supabase
              .from('organizations')
              .insert({
                name: `${userData.user.email?.split('@')[0]}'s Organization`,
                slug: `org-${Math.random().toString(36).substring(2, 10)}`
              })
              .select()
              .single();
              
            if (orgError) {
              console.error('Error creating organization:', orgError);
              // Continue with profile creation without an organization
            }
            
            const newProfile = {
              id: userId,
              username: userData.user.email,
              full_name: userData.user.user_metadata?.full_name || '',
              avatar_url: userData.user.user_metadata?.avatar_url || '',
              default_organization_id: newOrg?.id || null
            };
            
            const { data: insertedProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              console.log('New profile created:', insertedProfile);
              setProfile(insertedProfile);
              
              // If we created an organization, add the user as an owner
              if (newOrg) {
                const { error: memberError } = await supabase
                  .from('organization_members')
                  .insert({
                    organization_id: newOrg.id,
                    user_id: userId,
                    role: 'owner'
                  });
                  
                if (memberError) {
                  console.error('Error adding user to organization:', memberError);
                } else {
                  console.log('User added as owner to new organization:', newOrg.id);
                  
                  // Add default permissions for the organization owner role
                  await setupDefaultPermissions(newOrg.id);
                }
              }
            }
          }
        } catch (createError) {
          console.error('Error creating user profile:', createError);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Setup default role permissions for a newly created organization
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
  const assignPermissionToRole = async (organizationId: string, permissionId: string, role: RoleType) => {
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
  const setupRolePermissions = async (organizationId: string, role: RoleType, permissionNames: string[]) => {
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
    loading,
    fetchProfile,
  };
};
