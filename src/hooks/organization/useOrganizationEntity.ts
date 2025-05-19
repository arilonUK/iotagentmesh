
import { useState } from 'react';
import { Organization } from '@/contexts/auth/types';
import { supabase } from '@/integrations/supabase/client';

export type OrganizationEntityReturn = {
  organization: Organization | null;
  setOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
  fetchOrganizationEntity: (orgId: string) => Promise<void>;
};

export const useOrganizationEntity = (): OrganizationEntityReturn => {
  const [organization, setOrganization] = useState<Organization | null>(null);

  const fetchOrganizationEntity = async (orgId: string) => {
    if (!orgId) {
      console.log('Missing organization ID');
      return;
    }

    console.log(`Fetching organization details for org: ${orgId}`);
    
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, slug, created_at, updated_at')
        .eq('id', orgId)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
      } else if (orgData) {
        // Set organization data immediately so UI can update
        setOrganization({
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
          logo: null, // Set default null since it's not in the database query
          created_at: orgData.created_at,
          updated_at: orgData.updated_at
        });
        console.log('Organization data fetched successfully:', orgData.name);
      }
    } catch (orgFetchError) {
      console.error('Exception fetching organization:', orgFetchError);
    }
  };

  return {
    organization,
    setOrganization,
    fetchOrganizationEntity
  };
};
