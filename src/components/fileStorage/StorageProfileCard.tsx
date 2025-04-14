
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileStorageProfile } from '@/services/fileStorageService';
import { Button } from '@/components/ui/button';
import { FolderOpen, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useStorageProfiles } from '@/hooks/useFileStorage';
import FileStorageProfileForm from './FileStorageProfileForm';
import { useNavigate } from 'react-router-dom';

interface StorageProfileCardProps {
  profile: FileStorageProfile;
}

const StorageProfileCard: React.FC<StorageProfileCardProps> = ({ profile }) => {
  const navigate = useNavigate();
  const { updateProfile, deleteProfile } = useStorageProfiles();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  
  const handleSubmit = (data: any) => {
    updateProfile.mutate({ 
      id: profile.id, 
      updates: data 
    }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
      }
    });
  };
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the storage profile "${profile.name}"?`)) {
      deleteProfile.mutate(profile.id);
    }
  };
  
  const openExplorer = () => {
    navigate(`/dashboard/storage/${profile.id}/explorer`);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile.name}</CardTitle>
        <CardDescription>Created: {new Date(profile.created_at).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {profile.description && <p className="text-sm">{profile.description}</p>}
          <p className="text-sm">
            <strong>Path:</strong> {profile.path}
          </p>
          {profile.device_id && (
            <p className="text-sm">
              <strong>Associated Device:</strong> {profile.device_id}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="default" onClick={openExplorer}>
          <FolderOpen className="h-4 w-4 mr-2" />
          Open
        </Button>
        
        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Storage Profile</DialogTitle>
              </DialogHeader>
              <FileStorageProfileForm 
                profile={profile}
                onSubmit={handleSubmit}
                isSubmitting={updateProfile.isPending}
              />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StorageProfileCard;
