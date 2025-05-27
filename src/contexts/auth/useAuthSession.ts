
import { useState, useEffect, useRef } from 'react';
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
  const authListenerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      if (initialized) return;
      
      try {
        console.log("useAuthSession: Loading initial session...");
        
        // Set up auth state listener first
        if (!authListenerRef.current) {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
              if (!isMounted) return;
              
              console.log("useAuthSession: Auth state changed:", event, newSession?.user?.email || 'no user');
              
              // Prevent rapid successive updates
              if (event === 'TOKEN_REFRESHED' && newSession?.user?.id === session?.user?.id) {
                console.log("useAuthSession: Token refreshed, updating session");
                setSession(newSession);
                return;
              }
              
              if (event === 'SIGNED_OUT' || !newSession) {
                console.log("useAuthSession: User signed out, clearing session");
                setSession(null);
                setUser(null);
              } else if (event === 'SIGNED_IN' && newSession) {
                console.log("useAuthSession: User signed in, setting new session");
                setSession(newSession);
                setUser(newSession.user);
              } else if (newSession && newSession.user?.id !== session?.user?.id) {
                // Only update if it's actually a different user/session
                console.log("useAuthSession: Different user session detected, updating");
                setSession(newSession);
                setUser(newSession.user);
              }
            }
          );
          
          authListenerRef.current = subscription;
        }
        
        // Then check for existing session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error("useAuthSession: Error loading initial session:", error);
          setSession(null);
          setUser(null);
        } else {
          console.log("useAuthSession: Initial session loaded:", currentSession?.user?.email || 'no session');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
        
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error("useAuthSession: Error during initialization:", error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (authListenerRef.current) {
        console.log("useAuthSession: Cleaning up auth state listener");
        authListenerRef.current.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  return {
    session,
    user,
    loading,
    setSession,
    setUser,
    setLoading
  };
};
