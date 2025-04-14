
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FileStorageProfile } from '@/services/storage';
import { formSchema, FormValues } from './FileStorageProfileFormSchema';
import { BasicInfoSection, PublicAccessSection } from './form-sections';

interface FileStorageProfileFormProps {
  profile?: FileStorageProfile;
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
  readOnly?: boolean;
}

const FileStorageProfileForm: React.FC<FileStorageProfileFormProps> = ({
  profile,
  onSubmit,
  isSubmitting,
  readOnly = false
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!profile && !form.getValues('id') && (
          <div className="text-sm text-muted-foreground mb-4">
            A unique ID will be generated when the storage profile is created
          </div>
        )}
        
        <BasicInfoSection form={form} readOnly={readOnly} />
        <PublicAccessSection form={form} profileId={profile?.id} readOnly={readOnly} />
        
        {!readOnly && (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : profile ? 'Update Profile' : 'Add Storage'}
          </Button>
        )}
      </form>
    </Form>
  );
};

export default FileStorageProfileForm;
