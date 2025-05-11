
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { invitationService } from '@/services/invitationService';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Mail } from 'lucide-react';

const inviteFormSchema = z.object({
  email: z.string().email('Valid email address required'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const InviteMemberForm = () => {
  const { organization, userRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Check if the user has permission to invite members
  const canInvite = hasPermission(userRole, PERMISSIONS.INVITE_MEMBERS);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    if (!organization || !canInvite) {
      toast.error("You don't have permission to invite members");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await invitationService.createInvitation({
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

  if (!canInvite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <span>Permission Required</span>
          </CardTitle>
          <CardDescription>
            You need admin or owner privileges to invite team members.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <FormDescription>
                An invitation will be sent to this email address.
              </FormDescription>
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
                  <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                  <SelectItem value="member">Member (Standard access)</SelectItem>
                  <SelectItem value="admin">Admin (Administrative access)</SelectItem>
                  {userRole === 'owner' && (
                    <SelectItem value="owner">Owner (Full access)</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                {field.value === 'viewer' && 'Can view resources but not modify them.'}
                {field.value === 'member' && 'Can create and manage most resources.'}
                {field.value === 'admin' && 'Can manage team members and all resources.'}
                {field.value === 'owner' && 'Has full control over the organization.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full flex items-center gap-2"
          disabled={isSubmitting}
        >
          <Mail className="h-4 w-4" />
          {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
        </Button>
      </form>
    </Form>
  );
};

export default InviteMemberForm;
