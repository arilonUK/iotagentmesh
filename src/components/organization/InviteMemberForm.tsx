
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { invitationServices } from '@/contexts/auth/invitationServices';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const inviteFormSchema = z.object({
  email: z.string().email('Valid email address required'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const InviteMemberForm = () => {
  const { organization } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    if (!organization) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await invitationServices.createInvitation({
        email: values.email,
        role: values.role,
        organizationId: organization.id,
      });
      
      form.reset();
    } catch (error) {
      console.error('Failed to invite member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!organization) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="colleague@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
        </Button>
      </form>
    </Form>
  );
};

export default InviteMemberForm;
