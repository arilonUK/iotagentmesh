
import { useState, useEffect, useRef } from 'react';
import { profileServices } from '@/services/profileServices';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { organizationSetupService } from '@/services/organizationSetupService';
import { UserOrganization } from '@/contexts/auth/types';

type OrganizationLoaderProps = {
  userId?: string;
  profile: any | null;
  fetchOrganizationData: (orgId: string, userId: string) => Promise<void>;
};

export const useOrganizationLoader = ({ userId, profile, fetchOrganizationData }: OrganizationLoaderProps) => {
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const orgsLoaded = useRef(false);

  useEffect(() => {
    const loadUserOrganizations = async () => {
      if (userId && !orgsLoaded.current) {
        console.log('Loading user organizations for', userId);
        try {
          const orgs = await profileServices.getUserOrganizations(userId);
          console.log('User organizations loaded:', orgs);
          
          if (orgs && orgs.length > 0) {
            setUserOrganizations(orgs);
            orgsLoaded.current = true;
            
            if (profile?.default_organization_id) {
              console.log('Loading default organization:', profile.default_organization_id);
              await fetchOrganizationData(profile.default_organization_id, userId);
            } else {
              const defaultOrg = orgs.find(org => org.is_default) || orgs[0];
              console.log('Using organization as default:', defaultOrg.id);
              await fetchOrganizationData(defaultOrg.id, userId);
              
              if (!profile?.default_organization_id) {
                try {
                  await supabase
                    .from('profiles')
                    .update({ default_organization_id: defaultOrg.id })
                    .eq('id', userId);
                  
                  console.log('Updated default organization to:', defaultOrg.id);
                } catch (updateError) {
                  console.error('Error updating default organization:', updateError);
                }
              }
            }
          } else {
            console.log('No organizations found for user, creating default organization');
            await createDefaultOrganization(userId);
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
  }, [userId, profile]);

  useEffect(() => {
    if (!userId) {
      orgsLoaded.current = false;
    }
  }, [userId]);

  const createDefaultOrganization = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        console.error('No user found');
        return;
      }
      
      const orgName = userData.user.email?.split('@')[0] + "'s Organization";
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
          user_id: userId,
          role: 'owner'
        });
        
      if (memberError) {
        console.error('Error adding user to organization:', memberError);
        throw memberError;
      }
      
      console.log('User added as owner to organization:', newOrg.id);
      
      await organizationSetupService.setupDefaultPermissions(newOrg.id);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ default_organization_id: newOrg.id })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating default organization:', updateError);
      }
      
      const updatedOrgs = await profileServices.getUserOrganizations(userId);
      if (updatedOrgs && updatedOrgs.length > 0) {
        setUserOrganizations(updatedOrgs);
        orgsLoaded.current = true;
        await fetchOrganizationData(newOrg.id, userId);
        
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
  };

  return { userOrganizations, setUserOrganizations };
};
