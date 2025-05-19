
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AuthSessionReturn = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useAuthSession = (): AuthSessionReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          // Clear session state completely
          setSession(null);
          setUser(null);
        } else {
          // Update session state
          setSession(newSession);
          setUser(newSession?.user ?? null);
        }
      }
    );
    
    // Then check for existing session
    const loadInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Got existing session:", currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error("Error loading initial session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    loading,
    setSession,
    setUser,
    setLoading
  };
};
