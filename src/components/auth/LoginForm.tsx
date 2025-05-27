
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

type LoginFormProps = {
  setAuthError: (error: string | null) => void;
};

const LoginForm = ({ setAuthError }: LoginFormProps) => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) {
      console.log("LoginForm: Already processing login, ignoring");
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);

    try {
      console.log("LoginForm: Starting login process for:", loginEmail);
      
      const result = await signIn(loginEmail, loginPassword);
      
      if (result?.error) {
        console.error("LoginForm: Login failed:", result.error.message);
        
        // Provide user-friendly error messages
        let errorMessage = result.error.message;
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        }
        
        setAuthError(errorMessage);
        setIsLoading(false);
      } else {
        console.log("LoginForm: Login successful, auth state will be handled by AuthProvider");
        // Don't set loading to false here - let AuthProvider handle it
      }
    } catch (error: any) {
      console.error("LoginForm: Login error:", error);
      setAuthError(error.message || 'An unexpected error occurred during sign in');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input 
          id="login-email"
          type="email" 
          placeholder="you@example.com"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <Link to="/reset-password" className="text-sm text-iot-purple hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input 
          id="login-password"
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={isLoading}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !loginEmail || !loginPassword}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
      
      {isLoading && (
        <div className="text-sm text-center text-muted-foreground">
          Please wait while we sign you in...
        </div>
      )}
    </form>
  );
};

export default LoginForm;
