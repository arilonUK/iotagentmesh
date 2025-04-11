import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { useOrganization } from "@/contexts/organization"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth"
import { Button } from "@/components/ui/button"
import { Bell } from 'lucide-react';

export function DashboardNav() {
  const { pathname } = useLocation()
  const { organization } = useOrganization()
  const { signOut, profile } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  
  return (
    <nav className="grid items-start gap-2">
      <Link
        to="/dashboard"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          pathname === "/dashboard" && "text-primary"
        )}
      >
        <Icons.home className="h-4 w-4" />
        <span>Home</span>
      </Link>
      <Link
        to="/dashboard/devices"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          pathname.startsWith("/dashboard/devices") && "text-primary"
        )}
      >
        <Icons.devices className="h-4 w-4" />
        <span>Devices</span>
      </Link>
      <Link
        to="/dashboard/endpoints"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          pathname.startsWith("/dashboard/endpoints") && "text-primary"
        )}
      >
        <Icons.activity className="h-4 w-4" />
        <span>Endpoints</span>
      </Link>
      <Link 
        to="/dashboard/alarms"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          pathname === "/dashboard/alarms" && "text-primary"
        )}
      >
        <Bell className="h-4 w-4" />
        <span>Alarms</span>
      </Link>
      {organization && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="justify-start px-3 text-left">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={organization.logo} alt={organization.name} />
                    <AvatarFallback>{organization.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{organization.name}</span>
                </div>
                <Icons.chevronDown className="h-4 w-4 opacity-50" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60" align="start">
            <DropdownMenuItem>
              <Link to="/dashboard/organization" className="w-full">
                Organization Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setIsSigningOut(true)
                signOut()
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
      )}
    </nav>
  );
}
