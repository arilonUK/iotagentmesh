
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../FileStorageProfileFormSchema';

interface PublicAccessSectionProps {
  form: UseFormReturn<FormValues>;
  profileId?: string;
  readOnly?: boolean;
}

export const PublicAccessSection: React.FC<PublicAccessSectionProps> = ({ 
  form, 
  profileId,
  readOnly = false 
}) => {
  const publicReadEnabled = form.watch('public_read');
  
  // Generate a base URL for public access
  const baseUrl = window.location.origin;
  const storageId = profileId || '[storage-id]';
  const httpPath = `${baseUrl}/api/storage/${storageId}`;

  return (
    <>
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
                disabled={readOnly}
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
                  <Input placeholder="index.html" {...field} readOnly={readOnly} />
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
              {profileId ? 
                "This URL allows public read-only access to the index file" : 
                "This URL will be available after creating the storage profile"}
            </FormDescription>
          </FormItem>
        </>
      )}
    </>
  );
};
