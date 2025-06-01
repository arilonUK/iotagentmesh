
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Camera, UserRound, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  initialAvatarUrl: string | null;
  username: string | null;
  onAvatarChange: (url: string) => void;
}

const AvatarUpload = ({ initialAvatarUrl, username, onAvatarChange }: AvatarUploadProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Update local state when prop changes
  useEffect(() => {
    console.log('AvatarUpload: initialAvatarUrl changed to:', initialAvatarUrl);
    setAvatarUrl(initialAvatarUrl);
  }, [initialAvatarUrl]);

  // Helper function to get user initials for avatar fallback
  const getUserInitials = () => {
    if (!username) return 'U';
    return username.slice(0, 2).toUpperCase();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image should be less than 2MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      // Create a preview URL for the uploaded image
      const previewUrl = URL.createObjectURL(file);
      console.log('AvatarUpload: Created preview URL:', previewUrl);
      
      setAvatarUrl(previewUrl);
      onAvatarChange(previewUrl);
      
      // In a real app, you would upload the file to a storage service
      // and get back a permanent URL
      // For demo purposes, we'll just simulate a delay and use the preview URL
      setTimeout(() => {
        setUploading(false);
        toast({
          title: "Avatar updated",
          description: "Your avatar has been uploaded successfully"
        });
        console.log('AvatarUpload: Upload complete, URL set to:', previewUrl);
      }, 1000);

      // Here's how you would upload to Supabase Storage in a real app:
      /*
      const userId = supabase.auth.getUser().then(({ data }) => data.user?.id);
      if (!userId) throw new Error("User not authenticated");
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      onAvatarChange(publicUrl);
      */
    } catch (error: any) {
      console.error('AvatarUpload: Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    console.log('AvatarUpload: Removing avatar');
    setAvatarUrl(null);
    onAvatarChange('');
    toast({
      title: "Avatar removed",
      description: "Your profile avatar has been removed"
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-24 h-24 p-0 rounded-full relative border-dashed">
            <Avatar className="w-full h-full">
              <AvatarImage src={avatarUrl || ''} />
              <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all">
              <Camera className="text-white opacity-0 group-hover:opacity-100" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="font-medium">Profile Picture</div>
            <div className="flex gap-2">
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploading} 
                className="flex-1"
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
              {avatarUrl && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleRemoveAvatar}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: Square JPG or PNG, max 2MB
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AvatarUpload;
