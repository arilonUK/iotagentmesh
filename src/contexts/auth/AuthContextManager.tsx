
import React, { useEffect } from 'react';
import { AuthProvider } from './AuthProvider';
import { useContextFactory, ContextType } from '@/contexts/ContextFactory';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextManagerProps {
  children: React.ReactNode;
}

export const AuthContextManager: React.FC<AuthContextManagerProps> = ({ children }) => {
  const { setSession } = useContextFactory();

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
          }
        );

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting initial session:', error);
          throw error;
        }

        setSession(session);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        if (!mounted) return;
        console.error('Auth initialization error:', error);
        throw error;
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [setSession]);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};
