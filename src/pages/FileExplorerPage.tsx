
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fileStorageService } from '@/services/fileStorageService';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import FileExplorer from '@/components/fileStorage/FileExplorer';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth';

const FileExplorerPage = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { organization } = useAuth();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['storage-profile', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      return fileStorageService.getStorageProfile(profileId);
    },
    enabled: !!profileId,
  });
  
  const goBack = () => {
    navigate('/dashboard/storage');
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Loading storage profile...</div>;
  }
  
  if (!profile || !organization) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Storage
        </Button>
        <div className="text-center py-8">Storage profile not found</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Storage
        </Button>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold">{profile.name}</h1>
        {profile.description && (
          <p className="text-muted-foreground mt-2">{profile.description}</p>
        )}
      </div>
      
      <Separator />
      
      <FileExplorer 
        organizationId={organization.id} 
        initialPath={profile.path}
      />
    </div>
  );
};

export default FileExplorerPage;
