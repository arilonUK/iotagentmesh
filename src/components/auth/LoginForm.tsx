
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
    setIsLoading(true);
    setAuthError(null);

    try {
      await signIn(loginEmail, loginPassword);
    } catch (error: any) {
      setAuthError(error.message || 'Failed to sign in');
    } finally {
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
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
