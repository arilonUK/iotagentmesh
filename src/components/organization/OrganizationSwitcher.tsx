
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export function OrganizationSwitcher() {
  return (
    <Button variant="outline" className="flex items-center gap-2">
      <span>My Organization</span>
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
}
