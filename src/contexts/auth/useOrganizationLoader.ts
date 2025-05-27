
import { useRef } from 'react';
import { organizationService } from '@/services/profile/organizationService';
import { AuthContextType } from './types';

export const useOrganizationLoader = (authState: AuthContextType) => {
  const {
    setOrganizations,
    setUserOrganizations,
    setCurrentOrganization,
    setUserRole,
    setOrganization,
  } = authState;

  // Separate function for loading organizations that doesn't block auth
  const loadUserOrganizationsAsync = async (userId: string): Promise<void> => {
    try {
      console.log("AuthProvider: Loading user organizations asynchronously");
      const userOrgs = await organizationService.getUserOrganizations(userId);
      
      if (userOrgs && userOrgs.length > 0) {
        console.log("AuthProvider: Successfully loaded organizations:", userOrgs.length);
        
        setOrganizations(userOrgs);
        setUserOrganizations(userOrgs);
        
        // Set current organization based on default
        const defaultOrg = userOrgs.find(org => org.is_default) || userOrgs[0];
        if (defaultOrg) {
          setCurrentOrganization(defaultOrg);
          setUserRole(defaultOrg.role);
          
          // Set organization for extended context
          setOrganization({
            id: defaultOrg.id,
            name: defaultOrg.name,
            slug: defaultOrg.slug
          });
        }
      } else {
        console.log("AuthProvider: No organizations found");
        setOrganizations([]);
        setUserOrganizations([]);
        setCurrentOrganization(null);
        setUserRole(null);
        setOrganization(null);
      }
    } catch (error) {
      console.error("AuthProvider: Error loading organizations (non-blocking):", error);
      // Set empty state but don't block authentication
      setOrganizations([]);
      setUserOrganizations([]);
      setCurrentOrganization(null);
      setUserRole(null);
      setOrganization(null);
    }
  };

  return { loadUserOrganizationsAsync };
};
