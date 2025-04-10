
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building2, User, UserRound } from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { roleColors } from '@/lib/utils';

type ProfileFormData = {
  username: string;
  full_name: string;
  avatar_url: string;
};

const ProfileInfoForm = () => {
  const { user, profile, organization, userRole, updateProfile } = useAuth();
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

  const handleAvatarChange = (url: string) => {
    setFormData({
      ...formData,
      avatar_url: url,
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

  const getRoleBadgeColor = (role: string | null) => {
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-500';
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {organization && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Organization</h3>
                </div>
                {userRole && (
                  <Badge className={getRoleBadgeColor(userRole)}>
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>
                )}
              </div>
              <div className="grid gap-2">
                <div>
                  <p className="font-semibold">{organization.name}</p>
                  <p className="text-sm text-muted-foreground">@{organization.slug}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-6">
          <AvatarUpload 
            initialAvatarUrl={profile?.avatar_url || null}
            username={profile?.username || null}
            onAvatarChange={handleAvatarChange}
          />
        </div>

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
            <p className="text-sm text-muted-foreground mt-1">
              You can manually enter a URL or use the avatar upload above
            </p>
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
