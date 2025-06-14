
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
import { Check, Building, ChevronDown } from 'lucide-react';
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
    availableOrganizations,
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
        <Building className="h-4 w-4" />
        <span>Loading...</span>
      </Button>
    );
  }
  
  // Show nothing if no organizations are available
  if (!availableOrganizations || availableOrganizations.length === 0) {
    // If we have organization from context but no userOrganizations, still show it
    if (displayOrganization) {
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
    
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className={cn("flex items-center gap-2 px-3", triggerClassName)}
        disabled
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

  const displayName = displayOrganization?.name || availableOrganizations[0]?.name || 'Select Organization';

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
