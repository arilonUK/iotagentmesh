
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type ProfileFormData = {
  username: string;
  full_name: string;
  avatar_url: string;
};

const ProfileInfoForm = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateProfile(formData);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email" 
              value={user.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground mt-1">Your email cannot be changed</p>
          </div>
          
          <div>
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input 
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input 
              id="avatar_url"
              name="avatar_url"
              type="text"
              value={formData.avatar_url}
              onChange={handleInputChange}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </>
  );
};

export default ProfileInfoForm;
