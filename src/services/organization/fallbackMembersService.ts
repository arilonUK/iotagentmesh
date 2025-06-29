
import { supabase } from '@/integrations/supabase/client';
import { OrganizationUser } from '@/types/organization';

// Create a fallback members list for default organizations
export async function createFallbackMembersList(): Promise<OrganizationUser[]> {
  try {
    // Get current user info
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return [];
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .maybeSingle();
    
    const fallbackMember: OrganizationUser = {
      id: `member-${user.id}`,
      user_id: user.id,
      role: 'owner',
      email: user.email || profile?.username || 'Unknown',
      full_name: profile?.full_name || 'Unknown User',
      username: profile?.username || user.email || 'Unknown'
    };
    
    console.log('Created fallback member:', fallbackMember);
    return [fallbackMember];
  } catch (error) {
    console.error('Error creating fallback members list:', error);
    return [];
  }
}
