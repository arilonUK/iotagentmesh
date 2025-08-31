import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Payment = Database['public']['Tables']['payments']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];

export const paymentService = {
  async getPayments(organizationId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from<Database['public']['Tables']['payments']['Row']>('payments')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  },

  async getInvoices(organizationId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from<Database['public']['Tables']['invoices']['Row']>('invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  },
};

