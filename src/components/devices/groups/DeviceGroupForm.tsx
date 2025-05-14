
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DeviceGroupFormData } from '@/types/deviceGroup';
import { Save, Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, { message: "Group name is required" }),
  description: z.string().optional()
});

interface DeviceGroupFormProps {
  onSubmit: (data: DeviceGroupFormData) => void;
  defaultValues?: DeviceGroupFormData;
  isLoading?: boolean;
}

export function DeviceGroupForm({ 
  onSubmit, 
  defaultValues = {
    name: '',
    description: ''
  },
  isLoading = false
}: DeviceGroupFormProps) {
  const form = useForm<DeviceGroupFormData>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  
  const handleSubmit = (data: DeviceGroupFormData) => {
    onSubmit(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter group description (optional)" 
                  className="resize-none min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full mt-4" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Group
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
