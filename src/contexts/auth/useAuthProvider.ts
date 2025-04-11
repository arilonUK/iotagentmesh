
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
