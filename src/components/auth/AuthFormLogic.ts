
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';

export const useAuthFormLogic = () => {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log("Attempting login for:", email);
      const result = await signIn(email, password);
      
      if (result?.error) {
        console.error("Login error:", result.error);
        let errorMessage = result.error.message;
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        }
        
        setIsLoading(false);
        return { error: errorMessage };
      }
      
      console.log("Login successful");
      // Don't set loading to false here - let the auth state change handle it
      return { success: true };
    } catch (error: any) {
      console.error("Login exception:", error);
      setIsLoading(false);
      return { error: error.message || 'An unexpected error occurred during sign in' };
    }
  };

  const handleSignup = async (email: string, password: string, confirmPassword: string, metadata?: any) => {
    if (isLoading) return;
    
    if (password !== confirmPassword) {
      return { error: 'Passwords do not match' };
    }

    if (!metadata?.organization_name?.trim()) {
      return { error: 'Organization name is required' };
    }

    setIsLoading(true);
    
    try {
      const usernameToUse = metadata.username?.trim() || email.split('@')[0];
      
      const result = await signUp(email, password, {
        username: usernameToUse,
        full_name: metadata.full_name,
        organization_name: metadata.organization_name,
      });
      
      if (result?.error) {
        setIsLoading(false);
        return { error: result.error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { error: error.message || 'Failed to sign up' };
    }
  };

  return {
    isLoading,
    handleLogin,
    handleSignup
  };
};
