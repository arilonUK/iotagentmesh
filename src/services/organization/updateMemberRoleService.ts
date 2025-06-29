
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { createAuditLog } from '@/services/audit/createAuditLog';
import { isFallbackOrganization } from './organizationUtils';

// Update a user's role
export async function updateOrganizationMemberRole(
  organizationId: string, 
  userId: string, 
  newRole: string
): Promise<boolean> {
  try {
    // Handle fallback organizations
    if (isFallbackOrganization(organizationId)) {
      toast.error('Cannot update roles in fallback organization');
      return false;
    }
    
    // Get current role before update for audit log
    const { data: currentMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single();
    
    const oldRole = currentMember?.role;
    
    // Get user details for audit log
    const { data: userData } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', userId)
      .single();
    
    // Cast newRole to the correct enum type to match database constraint
    const validRole = newRole as Database["public"]["Enums"]["role_type"];
    
    // The RLS policies will automatically handle permission checking
    const { error } = await supabase
      .from('organization_members')
      .update({ role: validRole })
      .eq('organization_id', organizationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating role:', error);
      toast.error('Error updating role - insufficient permissions');
      return false;
    }

    // Create audit log entry
    await createAuditLog(
      organizationId, 
      'role_updated', 
      { 
        user_id: userId,
        username: userData?.username,
        full_name: userData?.full_name,
        old_role: oldRole, 
        new_role: newRole 
      }
    );

    toast.success('Role updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating role:', error);
    toast.error('Error updating role');
    return false;
  }
}
