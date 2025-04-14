import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { useStorageProfiles } from '@/hooks/useFileStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FileStorageProfileForm from '@/components/fileStorage/FileStorageProfileForm';
import StorageProfileCard from '@/components/fileStorage/StorageProfileCard';
import { PlusCircle, HardDrive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const FileStorage = () => {
  const { organization } = useAuth();
  const { 
    profiles, 
    isLoading, 
    createProfile,
  } = useStorageProfiles(organization?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const handleCreateProfile = (data: any) => {
    if (!organization) return;
    
    // Ensure we're not sending an ID when creating a new profile
    const { id, ...profileData } = data;
    
    createProfile.mutate({
      ...profileData,
      organization_id: organization.id
    }, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      }
    });
  };
  
  const filteredProfiles = searchTerm
    ? profiles.filter(profile =>
        profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    : profiles;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">File Storage</h1>
        <p className="text-muted-foreground">Manage your device files and storage profiles</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search storage profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Storage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Storage Profile</DialogTitle>
            </DialogHeader>
            <FileStorageProfileForm
              onSubmit={handleCreateProfile}
              isSubmitting={createProfile.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading storage profiles...</div>
      ) : filteredProfiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map(profile => (
            <StorageProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md flex flex-col items-center justify-center gap-4">
          <HardDrive className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="font-medium text-lg">
              {searchTerm ? 'No matching profiles' : 'No storage profiles'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Create your first storage profile to manage device files'}
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Storage
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileStorage;
