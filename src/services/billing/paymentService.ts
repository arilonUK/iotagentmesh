// Payment and invoice handling is not implemented yet because the
// corresponding tables do not exist in the Supabase schema. We provide
// placeholder types and stubbed service methods so the application can
// compile without database tables.

// Payment and Invoice types - using placeholder definitions since tables don't exist in schema
export type Payment = {
  id: string;
  organization_id: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'canceled';
  created_at: string;
};

export type Invoice = {
  id: string;
  organization_id: string;
  amount_due: number;
  status: string;
  created_at: string;
};

export const paymentService = {
  async getPayments(_organizationId: string): Promise<Payment[]> {
    // TODO: Replace with actual implementation once payments table exists
    console.warn('Supabase payments table not implemented - returning empty array');
    return [];
  },

  async getInvoices(_organizationId: string): Promise<Invoice[]> {
    // TODO: Replace with actual implementation once invoices table exists
    console.warn('Supabase invoices table not implemented - returning empty array');
    return [];
  },
};

