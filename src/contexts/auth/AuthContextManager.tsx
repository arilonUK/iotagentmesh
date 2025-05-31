
import React, { useEffect } from 'react';
import { AuthProvider } from './AuthProvider';
import { useAppContext, InitializationPhase } from '@/contexts/AppContextFactory';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextManagerProps {
  children: React.ReactNode;
}

export const AuthContextManager: React.FC<AuthContextManagerProps> = ({ children }) => {
  const { setPhase, setSession, setError } = useAppContext();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) return;
            
            console.log('Auth state change:', event, session?.user?.id);
            setSession(session);
            
            // Update phase based on auth state
            if (session) {
              setPhase(InitializationPhase.AUTH_READY);
            }
          }
        );

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting initial session:', error);
          setError(error);
          return;
        }

        setSession(session);
        setPhase(session ? InitializationPhase.AUTH_READY : InitializationPhase.SERVICES_READY);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        if (!mounted) return;
        console.error('Auth initialization error:', error);
        setError(error as Error);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [setPhase, setSession, setError]);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};
