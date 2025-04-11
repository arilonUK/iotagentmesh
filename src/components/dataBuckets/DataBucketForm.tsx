
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DataBucketFormData } from '@/types/dataBucket';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Database, Cloud } from 'lucide-react';

// Define the schema for validation
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  deviceId: z.string().uuid('Must be a valid device ID'),
  storageBackend: z.enum(['postgres', 's3']),
  readingType: z.string().min(1, 'Reading type is required'),
  retentionDays: z.number().min(1, 'Retention must be at least 1 day'),
  samplingInterval: z.number().optional(),
  enabled: z.boolean(),
  s3Config: z.object({
    bucketName: z.string().min(1, 'S3 bucket name is required'),
    region: z.string().min(1, 'S3 region is required'),
    path: z.string().optional()
  }).optional()
});

interface DataBucketFormProps {
  initialData?: Partial<DataBucketFormData>;
  onSubmit: (data: DataBucketFormData) => void;
  isSubmitting: boolean;
  deviceOptions: { id: string; name: string }[];
}

const DataBucketForm: React.FC<DataBucketFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  deviceOptions
}) => {
  const form = useForm<DataBucketFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      deviceId: initialData?.deviceId || '',
      storageBackend: initialData?.storageBackend || 'postgres',
      readingType: initialData?.readingType || '',
      retentionDays: initialData?.retentionDays || 30,
      samplingInterval: initialData?.samplingInterval || 60,
      enabled: initialData?.enabled ?? true,
      s3Config: initialData?.s3Config || {
        bucketName: '',
        region: '',
        path: ''
      }
    }
  });
  
  const storageBackend = form.watch('storageBackend');
  
  const handleSubmit = (data: DataBucketFormData) => {
    // Remove S3 config if postgres is selected
    if (data.storageBackend === 'postgres') {
      data.s3Config = undefined;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bucket Name</FormLabel>
              <FormControl>
                <Input placeholder="Temperature Data" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for your data bucket
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Stores temperature readings from living room sensor" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="deviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  {...field}
                >
                  <option value="">Select a device</option>
                  {deviceOptions.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                Select the device that will send data to this bucket
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="readingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reading Type</FormLabel>
              <FormControl>
                <Input placeholder="temperature" {...field} />
              </FormControl>
              <FormDescription>
                The type of data being stored (e.g., temperature, humidity)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="storageBackend"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Storage Backend</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="postgres" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      PostgreSQL
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="s3" />
                    </FormControl>
                    <FormLabel className="font-normal flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      AWS S3
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {storageBackend === 's3' && (
          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="font-medium">S3 Configuration</h3>
            
            <FormField
              control={form.control}
              name="s3Config.bucketName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>S3 Bucket Name</FormLabel>
                  <FormControl>
                    <Input placeholder="my-iot-data" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="s3Config.region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>S3 Region</FormLabel>
                  <FormControl>
                    <Input placeholder="us-east-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="s3Config.path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>S3 Path (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="device-data/" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormDescription>
                    Optional path prefix within the bucket
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <FormField
          control={form.control}
          name="retentionDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Retention (Days)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  {...field}
                  onChange={event => field.onChange(Number(event.target.value))}
                />
              </FormControl>
              <FormDescription>
                How long data will be stored before automatic deletion
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="samplingInterval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sampling Interval (Seconds, Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  placeholder="60"
                  {...field}
                  value={field.value || ''}
                  onChange={event => field.onChange(event.target.value ? Number(event.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                Downsample data to this interval (leave empty for no downsampling)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Enable Data Collection
                </FormLabel>
                <FormDescription>
                  When enabled, this bucket will collect and store data
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : 'Save Data Bucket'}
        </Button>
      </form>
    </Form>
  );
};

export default DataBucketForm;
