
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function OrganizationFooter() {
  const { signOut, organization, userRole } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  if (!organization) return null;
  
  return (
    <div className="mt-auto pt-4 px-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="justify-start w-full text-left">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={organization.logo} alt={organization.name} />
                  <AvatarFallback>{organization.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{organization.name || 'My Organization'}</span>
              </div>
              <Icons.chevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60" align="start">
          {userRole === 'owner' && (
            <>
              <DropdownMenuItem>
                <Link to="/dashboard/organization" className="w-full">
                  Organization Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={() => {
              setIsSigningOut(true);
              signOut();
            }}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <div className="flex items-center justify-center gap-2">
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                <span>Signing Out...</span>
              </div>
            ) : (
              "Sign Out"
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
