
import { useState } from "react"
import { useTheme } from "next-themes"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import { settingsMenuConfig } from "@/components/navigation/navConfig"
import { NotificationBell } from './notifications/NotificationBell'
import { OrganizationSwitcher } from '@/components/organization/OrganizationSwitcher'
import { useAuth } from "@/contexts/auth"

export const Header = () => {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { session, user, signOut } = useAuth()
  
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut()
      // Redirect happens inside the signOut function
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false);
      // Fallback navigation in case the redirection in signOut fails
      navigate('/auth');
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center gap-4">
          <OrganizationSwitcher />
        </div>
        <div className="ml-auto flex items-center space-x-2">
          {/* Add NotificationBell before the other items */}
          <NotificationBell />
          
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 lg:h-10 lg:w-10">
                <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={user?.user_metadata?.full_name || "Avatar"} />
                  <AvatarFallback>{user?.user_metadata?.full_name?.slice(0, 2).toUpperCase() || "AV"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              {settingsMenuConfig.map((item) => (
                <DropdownMenuItem key={item.href} onSelect={() => {
                  navigate(item.href)
                  setIsDropdownOpen(false)
                }}>
                  {item.title}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                disabled={isSigningOut}
                onSelect={(e) => {
                  e.preventDefault();
                  handleSignOut();
                  setIsDropdownOpen(false);
                }}>
                {isSigningOut ? (
                  <div className="flex items-center gap-2">
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    <span>Signing Out...</span>
                  </div>
                ) : (
                  "Log out"
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
