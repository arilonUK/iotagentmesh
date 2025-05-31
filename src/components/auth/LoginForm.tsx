
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { useAuthFormLogic } from './AuthFormLogic';

type LoginFormProps = {
  setAuthError: (error: string | null) => void;
};

const LoginForm = ({ setAuthError }: LoginFormProps) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const { isLoading, handleLogin } = useAuthFormLogic();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const result = await handleLogin(loginEmail, loginPassword);
    
    if (result?.error) {
      setAuthError(result.error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
