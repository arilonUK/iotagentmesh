
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building, PaintBucket, CircleDollarSign } from 'lucide-react';

const OrganizationSettings = () => {
  const { organization, userRole } = useAuth();
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Only owners can access organization settings
  if (!organization || userRole !== 'owner') {
    return (
      <div className="container max-w-3xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>
              You don't have permission to access organization settings. Only organization owners can access this area.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Here we would make an API call to update the organization
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Organization settings updated successfully');
    } catch (error) {
      console.error('Error updating organization settings:', error);
      toast.error('Failed to update organization settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-3xl py-8">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <PaintBucket className="h-4 w-4" />
            <span>Branding</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage general information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input 
                    id="orgName" 
                    value={orgName} 
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="orgSlug">Organization Slug</Label>
                  <Input 
                    id="orgSlug" 
                    value={organization.slug || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    The organization slug cannot be changed.
                  </p>
                </div>
                
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize the appearance of your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Organization Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-md bg-gray-100 border flex items-center justify-center">
                    {organization?.logo ? (
                      <img 
                        src={organization.logo} 
                        alt="Organization logo" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Building className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <Button variant="outline">Upload Logo</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 512x512 pixels. Max file size: 2MB.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage billing settings for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center">
                <CircleDollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Billing settings coming soon</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Billing management features will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationSettings;
