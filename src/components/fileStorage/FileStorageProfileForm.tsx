
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileStorageProfile } from '@/services/fileStorageService';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  path: z.string().min(1, 'Path is required'),
  public_read: z.boolean().default(false),
  index_file: z.string().default('index.html'),
});

type FormValues = z.infer<typeof formSchema>;

interface FileStorageProfileFormProps {
  profile?: FileStorageProfile;
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
}

const FileStorageProfileForm: React.FC<FileStorageProfileFormProps> = ({
  profile,
  onSubmit,
  isSubmitting
}) => {
  const { organization } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: profile?.id || '',
      name: profile?.name || '',
      description: profile?.description || '',
      path: profile?.path || '',
      public_read: profile?.public_read || false,
      index_file: profile?.index_file || 'index.html',
    },
  });

  const publicReadEnabled = form.watch('public_read');
  
  // Generate a base URL for public access
  const baseUrl = window.location.origin;
  const storageId = profile?.id || '[storage-id]';
  const httpPath = `${baseUrl}/api/storage/${storageId}`;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {profile ? (
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage ID</FormLabel>
                <FormControl>
                  <Input readOnly value={field.value} />
                </FormControl>
                <FormDescription>
                  The unique identifier for this storage profile
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormDescription className="mb-4">
            A unique ID will be generated when the storage profile is created
          </FormDescription>
        )}
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Device Firmware" {...field} />
              </FormControl>
              <FormDescription>
                A mnemonic name for this storage profile
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the purpose of this storage profile" {...field} />
              </FormControl>
              <FormDescription>
                Additional information about this storage profile
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Path</FormLabel>
              <FormControl>
                <Input placeholder="e.g., firmware/v1" {...field} />
              </FormControl>
              <FormDescription>
                The path within the storage system
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="public_read"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Public Read</FormLabel>
                <FormDescription>
                  Enable public read-only access to this storage profile
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {publicReadEnabled && (
          <>
            <FormField
              control={form.control}
              name="index_file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Index File</FormLabel>
                  <FormControl>
                    <Input placeholder="index.html" {...field} />
                  </FormControl>
                  <FormDescription>
                    The default file to open when accessing the public HTTP path
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>HTTP Path</FormLabel>
              <div className="flex items-center space-x-2">
                <Input readOnly value={httpPath} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(httpPath);
                  }}
                >
                  Copy
                </Button>
              </div>
              <FormDescription>
                {profile ? 
                  "This URL allows public read-only access to the index file" : 
                  "This URL will be available after creating the storage profile"}
              </FormDescription>
            </FormItem>
          </>
        )}
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : profile ? 'Update Profile' : 'Add Storage'}
        </Button>
      </form>
    </Form>
  );
};

export default FileStorageProfileForm;
