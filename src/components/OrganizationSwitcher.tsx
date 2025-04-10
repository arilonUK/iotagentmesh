
import React from 'react';
import { useAuth } from '@/contexts/auth';
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
  const { organization, userOrganizations, switchOrganization } = useAuth();
  
  if (!organization || userOrganizations.length <= 1) {
    return null;
  }

  const handleSwitchOrg = async (orgId: string) => {
    await switchOrganization(orgId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("flex items-center gap-2 px-3", triggerClassName)}
        >
          <Building className="h-4 w-4" />
          <span className="truncate max-w-[150px]">{organization.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-[220px]", dropdownClassName)}>
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userOrganizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitchOrg(org.id)}
            className="cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>{org.name}</span>
            </div>
            {org.is_default && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrganizationSwitcher;
