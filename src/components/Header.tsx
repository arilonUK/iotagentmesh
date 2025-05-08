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

export const Header = () => {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Mock user session for now
  const session = {
    user: {
      name: 'User Name',
      email: 'user@example.com',
      image: '',
    }
  }

  const handleSignOut = async () => {
    // Placeholder for sign out functionality
    navigate("/auth") // Changed from "/login" to "/auth"
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
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "Avatar"} />
                  <AvatarFallback>{session?.user?.name?.slice(0, 2).toUpperCase() || "AV"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
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
              <DropdownMenuItem onSelect={() => {
                handleSignOut()
                setIsDropdownOpen(false)
              }}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
