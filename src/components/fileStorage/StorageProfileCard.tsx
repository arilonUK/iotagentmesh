import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileStorageProfile } from '@/services/fileStorageService';
import { Button } from '@/components/ui/button';
import { FolderOpen, Pencil, Trash2, ExternalLink, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useStorageProfiles } from '@/hooks/useFileStorage';
import FileStorageProfileForm from './FileStorageProfileForm';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

  const copyUrl = () => {
    if (profile.public_read) {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/api/storage/${profile.id}`;
      navigator.clipboard.writeText(url);
      toast.success('HTTP path copied to clipboard');
    }
  };

  const openPublicUrl = () => {
    if (profile.public_read) {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/api/storage/${profile.id}`;
      window.open(url, '_blank');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile.name}</CardTitle>
        <CardDescription>Created: {new Date(profile.created_at).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium">Storage ID: {profile.id}</p>
          {profile.description && <p className="text-sm">{profile.description}</p>}
          <p className="text-sm">
            <strong>Path:</strong> {profile.path}
          </p>
          {profile.public_read && (
            <>
              <p className="text-sm">
                <strong>Public Access:</strong> Enabled
              </p>
              <p className="text-sm">
                <strong>Index File:</strong> {profile.index_file}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyUrl}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTTP Path
                </Button>
                <Button variant="outline" size="sm" onClick={openPublicUrl}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="default" onClick={openExplorer}>
          <FolderOpen className="h-4 w-4 mr-2" />
          Storage Explorer
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
