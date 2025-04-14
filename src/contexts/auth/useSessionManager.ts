
import { useEffect } from 'react';
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

  useEffect(() => {
    if (user) {
      // Use setTimeout to prevent supabase deadlock
      setTimeout(() => {
        fetchProfile(user.id);
      }, 0);
    }
  }, [user]);

  return {
    session,
    user,
    profile,
    loading,
    fetchProfile,
  };
};
