
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
};

export const useSessionManager = (): SessionManagerReturn => {
  const { session, user, loading } = useAuthSession();
  const { profile, fetchProfile } = useProfileManager();
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  useEffect(() => {
    // Only refetch profile when user ID changes (not on every render)
    if (user?.id && user.id !== lastUserId) {
      setLastUserId(user.id);
      console.log("User ID changed, fetching updated profile for:", user.id);
      
      // Use setTimeout to prevent supabase deadlock
      setTimeout(() => {
        fetchProfile(user.id);
      }, 0);
    } else if (!user && lastUserId) {
      // Reset lastUserId when user logs out
      setLastUserId(null);
    }
  }, [user?.id, lastUserId, fetchProfile]);

  return {
    session,
    user,
    profile,
    loading,
    fetchProfile,
  };
};
