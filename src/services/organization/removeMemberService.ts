
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createAuditLog } from '@/services/audit/createAuditLog';
import { isFallbackOrganization } from './organizationUtils';

// Remove a user from an organization
export async function removeOrganizationMember(organizationId: string, userId: string): Promise<boolean> {
  try {
    // Handle fallback organizations
    if (isFallbackOrganization(organizationId)) {
      toast.error('Cannot remove members from fallback organization');
      return false;
    }
    
    // Get user details for audit log
    const { data: userData } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', userId)
      .single();
    
    // The RLS policies will automatically handle permission checking
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing user:', error);
      toast.error('Error removing user - insufficient permissions or user not found'); 
      return false;
    }
    
    // Create audit log entry
    await createAuditLog(
      organizationId, 
      'member_removed', 
      { 
        user_id: userId,
        username: userData?.username,
        full_name: userData?.full_name 
      }
    );

    toast.success('User removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing user:', error);
    toast.error('Error removing user');
    return false;
  }
}
