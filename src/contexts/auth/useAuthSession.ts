
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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Load initial session first
    const loadInitialSession = async () => {
      try {
        console.log("Loading initial session...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error("Error loading initial session:", error);
          setSession(null);
          setUser(null);
        } else {
          console.log("Initial session loaded:", currentSession?.user?.email || 'no session');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
        
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error("Error loading initial session:", error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    loadInitialSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    console.log("Setting up auth state listener...");
    
    // Set up auth state listener after initial load
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email || 'no user');
        
        // Prevent unnecessary updates if session hasn't actually changed
        if (event === 'TOKEN_REFRESHED' && newSession?.user?.id === session?.user?.id) {
          console.log("Token refreshed, updating session");
          setSession(newSession);
          return;
        }
        
        if (event === 'SIGNED_OUT' || !newSession) {
          console.log("User signed out, clearing session");
          setSession(null);
          setUser(null);
        } else if (event === 'SIGNED_IN' && newSession) {
          console.log("User signed in, setting new session");
          setSession(newSession);
          setUser(newSession.user);
        } else if (newSession) {
          // Handle other events like token refresh
          setSession(newSession);
          setUser(newSession.user);
        }
      }
    );

    return () => {
      console.log("Cleaning up auth state listener");
      subscription.unsubscribe();
    };
  }, [initialized, session?.user?.id]);

  return {
    session,
    user,
    loading,
    setSession,
    setUser,
    setLoading
  };
};
