
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building2, UserCog } from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { roleColors } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

type ProfileFormData = {
  username: string;
  full_name: string;
  avatar_url: string;
};

const ProfileInfoForm = () => {
  const { user, profile, organization, userRole, updateProfile, userOrganizations, switchOrganization } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

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
      // Pass only the form data to updateProfile as it now expects only one parameter
      await updateProfile(formData);
      toast('Profile updated successfully', {
        style: { backgroundColor: 'green', color: 'white' }
      });
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchOrganization = async (orgId: string) => {
    setIsLoading(true);
    try {
      await switchOrganization(orgId);
      toast('Organization switched', {
        style: { backgroundColor: 'green', color: 'white' }
      });
    } catch (error: any) {
      console.error("Error switching organization:", error);
      toast('Failed to switch organization', {
        style: { backgroundColor: 'red', color: 'white' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const getRoleBadgeColor = (role: string | null) => {
    if (!role) return 'bg-gray-500';
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-500';
  };

  const getRoleDescription = (role: string | null) => {
    if (!role) return '';
    
    switch(role) {
      case 'owner':
        return 'Full control over the organization, including billing and user management';
      case 'admin':
        return 'Can manage users and organization settings';
      case 'member':
        return 'Regular access to organization resources';
      case 'viewer':
        return 'Read-only access to organization resources';
      default:
        return '';
    }
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Role & Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-md font-medium">Your Role</h3>
              </div>
              {userRole ? (
                <Badge className={getRoleBadgeColor(userRole)}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              ) : (
                <Badge className="bg-gray-500">No Role Assigned</Badge>
              )}
            </div>
            
            {userRole ? (
              <p className="text-sm text-muted-foreground">{getRoleDescription(userRole)}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No role has been assigned. This might happen if you haven't been added to an organization or there's an issue with your organization membership.
              </p>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-md font-medium">Organization</h3>
              </div>
            </div>
            
            {organization ? (
              <div className="grid gap-1">
                <p className="font-medium">{organization.name}</p>
                <p className="text-sm text-muted-foreground">@{organization.slug}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No organization found. Please contact an administrator.
              </p>
            )}

            {userOrganizations.length > 1 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-md font-medium mb-2">Your Organizations</h3>
                  <div className="grid gap-2">
                    {userOrganizations.map(org => (
                      <div key={org.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-xs text-muted-foreground">Role: {org.role}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={isLoading || (organization && org.id === organization.id)}
                          onClick={() => handleSwitchOrganization(org.id)}
                        >
                          {organization && org.id === organization.id ? 'Current' : 'Switch'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

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
