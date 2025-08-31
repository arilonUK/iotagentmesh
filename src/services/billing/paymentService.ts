
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
      // Note: payments table may not exist in current schema
      const query = (supabase as unknown as { from: (table: string) => unknown }).from('payments') as unknown as {
        select: (columns: string) => {
          eq: (column: string, value: string) => {
            order: (column: string, options?: { ascending?: boolean }) => Promise<{ data?: unknown[]; error?: unknown }>
          }
        }
      };
      
      const { data, error } = await query
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data as unknown[]) || []).map((payment) => ({
        ...(payment as Record<string, unknown>),
        status: (payment as Record<string, unknown>).status as 'pending' | 'succeeded' | 'failed' | 'canceled'
      })) as Payment[];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  },

  // Invoices - using type assertion since the table is new
  async getInvoices(organizationId: string): Promise<Invoice[]> {
    try {
      // Note: invoices table may not exist in current schema
      const query = (supabase as unknown as { from: (table: string) => unknown }).from('invoices') as unknown as {
        select: (columns: string) => {
          eq: (column: string, value: string) => {
            order: (column: string, options?: { ascending?: boolean }) => Promise<{ data?: unknown[]; error?: unknown }>
          }
        }
      };
      
      const { data, error } = await query
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ((data as unknown[]) || []).map((invoice) => ({
        ...(invoice as Record<string, unknown>),
        status: (invoice as Record<string, unknown>).status as 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
      })) as Invoice[];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  },
};
