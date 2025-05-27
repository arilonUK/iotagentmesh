
import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from './types';
import { useProfileManager } from '@/hooks/auth/useProfileManager';
import { useAuthSession } from '@/hooks/auth/useAuthSession';

export type SessionManagerReturn = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useSessionManager = (): SessionManagerReturn => {
  const { 
    session, 
    user, 
    loading, 
    setSession,
    setUser,
    setLoading
  } = useAuthSession();
  
  const { 
    profile, 
    fetchProfile,
    setProfile
  } = useProfileManager();
  
  const [lastUserId, setLastUserId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    // Only fetch profile when user ID changes and we have a user
    if (user?.id && user.id !== lastUserId && !profileLoading) {
      setLastUserId(user.id);
      setProfileLoading(true);
      
      console.log("User ID changed, fetching profile for:", user.id);
      
      // Use a small delay to prevent rapid consecutive calls
      const timeoutId = setTimeout(async () => {
        try {
          await fetchProfile(user.id);
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setProfileLoading(false);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else if (!user && lastUserId) {
      // Reset when user logs out
      setLastUserId(null);
      setProfileLoading(false);
    }
  }, [user?.id, lastUserId, fetchProfile, profileLoading]);

  return {
    session,
    user,
    profile,
    loading: loading || profileLoading,
    fetchProfile,
    setSession,
    setUser,
    setProfile,
    setLoading,
  };
};
