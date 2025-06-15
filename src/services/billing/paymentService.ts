
import { supabase } from '@/integrations/supabase/client';

export interface Payment {
  id: string;
  organization_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  created_at: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  stripe_invoice_id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  invoice_pdf_url?: string;
  due_date?: string;
  period_start?: string;
  period_end?: string;
  created_at: string;
}

export const paymentService = {
  // Payments - using type assertion since the table is new
  async getPayments(organizationId: string): Promise<Payment[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('payments')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((payment: any) => ({
        ...payment,
        status: payment.status as 'pending' | 'succeeded' | 'failed' | 'canceled'
      }));
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  },

  // Invoices - using type assertion since the table is new
  async getInvoices(organizationId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((invoice: any) => ({
        ...invoice,
        status: invoice.status as 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
      }));
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  },
};
