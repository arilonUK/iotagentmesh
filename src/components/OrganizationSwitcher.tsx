
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useOrganization } from '@/contexts/organization';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Building, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrganizationSwitcherProps {
  triggerClassName?: string;
  dropdownClassName?: string;
}

const OrganizationSwitcher = ({ triggerClassName, dropdownClassName }: OrganizationSwitcherProps) => {
  // Try to get organization data from both contexts
  const { currentOrganization, userOrganizations, switchOrganization, loading: authLoading } = useAuth();
  const { organization, isLoading: orgLoading } = useOrganization();
  
  // Use organization context data as primary, auth context as fallback
  const displayOrganization = organization || currentOrganization;
  const availableOrganizations = userOrganizations || [];
  const loading = authLoading || orgLoading;
  
  console.log('OrganizationSwitcher render:', {
    displayOrganization,
    availableOrganizations: availableOrganizations.length,
    loading,
    authCurrentOrg: currentOrganization,
    contextOrg: organization
  });
  
  // Show loading state while organizations are being fetched
  if (loading) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={cn("flex items-center gap-2 px-3", triggerClassName)}
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </Button>
    );
  }
  
  // Show default organization if we have one but no userOrganizations array
  if (displayOrganization && (!availableOrganizations || availableOrganizations.length === 0)) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={cn("flex items-center gap-2 px-3", triggerClassName)}
      >
        <Building className="h-4 w-4" />
        <span className="truncate max-w-[150px]">
          {displayOrganization.name}
        </span>
      </Button>
    );
  }
  
  // Show "No Organization" only if we have no organizations at all
  if (!displayOrganization && (!availableOrganizations || availableOrganizations.length === 0)) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={cn("flex items-center gap-2 px-3 text-amber-600 border-amber-300", triggerClassName)}
      >
        <Building className="h-4 w-4" />
        <span>No Organization</span>
      </Button>
    );
  }

  // Show current org name but no dropdown if only one organization
  if (availableOrganizations.length === 1) {
    const displayName = displayOrganization?.name || availableOrganizations[0].name;
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={cn("flex items-center gap-2 px-3", triggerClassName)}
      >
        <Building className="h-4 w-4" />
        <span className="truncate max-w-[150px]">
          {displayName}
        </span>
      </Button>
    );
  }

  const handleSwitchOrg = async (orgId: string) => {
    if (switchOrganization) {
      console.log('Switching to organization:', orgId);
      try {
        await switchOrganization(orgId);
        console.log('Organization switch completed');
      } catch (error) {
        console.error('Error switching organization:', error);
      }
    }
  };

  const displayName = displayOrganization?.name || 'Select Organization';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("flex items-center gap-2 px-3 hover:bg-gray-50", triggerClassName)}
        >
          <Building className="h-4 w-4" />
          <span className="truncate max-w-[150px]">
            {displayName}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-[220px]", dropdownClassName)}>
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableOrganizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitchOrg(org.id)}
            className="cursor-pointer flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>{org.name}</span>
            </div>
            {(displayOrganization?.id === org.id || org.is_default) && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrganizationSwitcher;
