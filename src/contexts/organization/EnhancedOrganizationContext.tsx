
import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useStandardQuery, useStandardMutation } from '@/hooks/query/useStandardQuery';
import { organizationService } from '@/services/profile/organizationService';
import { UserOrganization } from '@/contexts/auth/types';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

interface EnhancedOrganizationContextType {
  organization: Organization | null;
  organizations: UserOrganization[];
  isLoading: boolean;
  isLoadingOrganizations: boolean;
  switchOrganization: (organizationId: string) => Promise<boolean>;
  refetchOrganizations: () => void;
  error: string | null;
}

const EnhancedOrganizationContext = createContext<EnhancedOrganizationContextType | undefined>(undefined);

export const useEnhancedOrganization = () => {
  const context = useContext(EnhancedOrganizationContext);
  if (context === undefined) {
    throw new Error("useEnhancedOrganization must be used within an EnhancedOrganizationProvider");
  }
  return context;
};

export const EnhancedOrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentOrganization, userId } = useAuth();

  // Fetch user organizations with standardized React Query
  const {
    data: organizations = [],
    isLoading: isLoadingOrganizations,
    error: organizationsError,
    refetch: refetchOrganizations,
  } = useStandardQuery(
    ['user-organizations', userId],
    () => organizationService.getUserOrganizations(userId!),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      showErrorToast: true,
      errorMessage: 'Failed to load organizations',
    }
  );

  // Transform the auth organization data to match the expected interface
  const organization: Organization | null = currentOrganization ? {
    id: currentOrganization.id,
    name: currentOrganization.name,
    slug: currentOrganization.slug,
    role: currentOrganization.role as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : null;

  // Switch organization mutation
  const switchOrganizationMutation = useStandardMutation(
    (organizationId: string) => 
      organizationService.switchOrganization(userId!, organizationId),
    {
      showSuccessToast: true,
      successMessage: 'Organization switched successfully',
      showErrorToast: true,
      errorMessage: 'Failed to switch organization',
      onSuccess: () => {
        refetchOrganizations();
      },
    }
  );

  const switchOrganization = useCallback(async (organizationId: string): Promise<boolean> => {
    try {
      const result = await switchOrganizationMutation.mutateAsync(organizationId);
      return result;
    } catch (error) {
      console.error('Error in organization context switchOrganization:', error);
      return false;
    }
  }, [switchOrganizationMutation]);

  const value: EnhancedOrganizationContextType = {
    organization,
    organizations,
    isLoading: switchOrganizationMutation.isPending,
    isLoadingOrganizations,
    switchOrganization,
    refetchOrganizations,
    error: organizationsError ? String(organizationsError) : null,
  };

  return (
    <EnhancedOrganizationContext.Provider value={value}>
      {children}
    </EnhancedOrganizationContext.Provider>
  );
};
