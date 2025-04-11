import React from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { useAuth } from '@/contexts/auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error in sign out flow:', error);
      navigate('/');
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    } else if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    } else if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="w-full border-b border-gray-100">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg iot-gradient-bg flex items-center justify-center">
              <span className="font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-semibold">NextGenIOT</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Products
          </Link>
          <Link to="/solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Solutions
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link to="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Documentation
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {user && (
                <Link to="/dashboard" className="text-sm font-medium hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{profile?.username || user.email}</span>
              </div>
              <Button onClick={handleSignOut} variant="outline">Log out</Button>
            </div>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline">Log in</Button>
              </Link>
              <Link to="/auth">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden py-4 px-6 border-t border-gray-100 bg-white animate-fade-in">
          <nav className="flex flex-col gap-4">
            <Link to="/products" className="text-sm font-medium py-2">
              Products
            </Link>
            <Link to="/solutions" className="text-sm font-medium py-2">
              Solutions
            </Link>
            <Link to="/pricing" className="text-sm font-medium py-2">
              Pricing
            </Link>
            <Link to="/docs" className="text-sm font-medium py-2">
              Documentation
            </Link>
            
            {user && (
              <Link to="/dashboard" className="text-sm font-medium py-2">
                Dashboard
              </Link>
            )}
            
            <div className="flex flex-col gap-2 pt-4">
              {user ? (
                <>
                  {profile && (
                    <div className="flex items-center gap-2 py-2">
                      <Avatar>
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{profile?.username || user.email}</span>
                    </div>
                  )}
                  <Button onClick={handleSignOut} variant="outline" className="w-full">Log out</Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
