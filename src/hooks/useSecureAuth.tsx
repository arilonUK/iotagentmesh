
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { rateLimiter, passwordSchema, emailSchema } from '@/lib/security';

/**
 * Enhanced authentication hook with security measures
 */
interface UserMetadata {
  [key: string]: unknown;
}

export const useSecureAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const secureSignUp = useCallback(async (email: string, password: string, userData?: UserMetadata) => {
    setIsLoading(true);
    
    try {
      // Validate inputs
      emailSchema.parse(email);
      passwordSchema.parse(password);
      
      // Rate limiting
      const clientId = `signup_${email}`;
      if (!rateLimiter.isAllowed(clientId, 3, 60 * 60 * 1000)) { // 3 attempts per hour
        toast.error('Too many signup attempts. Please try again later.');
        return { error: new Error('Rate limited') };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        console.error('Secure signup error:', error);
        toast.error(`Signup failed: ${error.message}`);
        return { error };
      }

      // Reset rate limit on success
      rateLimiter.reset(clientId);
      
      toast.success('Account created successfully. Please check your email to verify your account.');
      return { data };
    } catch (validationError: unknown) {
      console.error('Signup validation error:', validationError);
      const errorMessage = validationError instanceof Error 
        ? (validationError as any).errors?.[0]?.message || validationError.message
        : 'Invalid input';
      toast.error(errorMessage);
      return { error: validationError };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const secureSignIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Validate inputs
      emailSchema.parse(email);
      
      // Rate limiting for login attempts
      const clientId = `login_${email}`;
      if (!rateLimiter.isAllowed(clientId, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
        toast.error('Too many login attempts. Please try again in 15 minutes.');
        return { error: new Error('Rate limited') };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Secure signin error:', error);
        setLoginAttempts(prev => prev + 1);
        
        // Log security event for failed attempts
        if (loginAttempts >= 3) {
          console.warn(`Multiple failed login attempts for email: ${email}`);
          // In a production environment, you might want to log this to your security monitoring system
        }
        
        toast.error(`Login failed: ${error.message}`);
        return { error };
      }

      // Reset counters on successful login
      rateLimiter.reset(clientId);
      setLoginAttempts(0);
      
      toast.success('Successfully signed in');
      return { data };
    } catch (validationError: unknown) {
      console.error('Signin validation error:', validationError);
      const errorMessage = validationError instanceof Error 
        ? (validationError as any).errors?.[0]?.message || validationError.message
        : 'Invalid email format';
      toast.error(errorMessage);
      return { error: validationError };
    } finally {
      setIsLoading(false);
    }
  }, [loginAttempts]);

  const secureSignOut = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Secure signout error:', error);
        toast.error(`Logout failed: ${error.message}`);
        return { error };
      }
      
      toast.success('Successfully signed out');
      return { data: true };
    } catch (error) {
      console.error('Unexpected signout error:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    secureSignUp,
    secureSignIn,
    secureSignOut,
    isLoading,
    loginAttempts
  };
};
