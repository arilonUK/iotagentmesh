
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthFormLogic } from './AuthFormLogic';

type SignupFormProps = {
  setAuthError: (error: string | null) => void;
};

const SignupForm = ({ setAuthError }: SignupFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
    organizationName: ''
  });
  
  const { isLoading, handleSignup } = useAuthFormLogic();

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const result = await handleSignup(
      formData.email, 
      formData.password, 
      formData.confirmPassword,
      {
        username: formData.username,
        full_name: formData.fullName,
        organization_name: formData.organizationName,
      }
    );
    
    if (result?.error) {
      setAuthError(result.error);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input 
          id="signup-email"
          type="email" 
          placeholder="you@example.com"
          value={formData.email}
          onChange={updateField('email')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization-name">Organization Name</Label>
        <Input 
          id="organization-name"
          type="text"
          placeholder="Your Company Name"
          value={formData.organizationName}
          onChange={updateField('organizationName')}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username (Optional)</Label>
          <Input 
            id="username"
            type="text"
            value={formData.username}
            onChange={updateField('username')}
            placeholder="Leave blank to use email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input 
            id="full-name"
            type="text"
            value={formData.fullName}
            onChange={updateField('fullName')}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input 
          id="signup-password"
          type="password"
          value={formData.password}
          onChange={updateField('password')}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input 
          id="confirm-password"
          type="password"
          value={formData.confirmPassword}
          onChange={updateField('confirmPassword')}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default SignupForm;
