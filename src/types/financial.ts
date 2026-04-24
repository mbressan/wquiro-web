export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'bank_slip';
export type PaymentStatus = 'pending' | 'paid' | 'waived';

export interface Payment {
  id: string;
  appointment: string | null;
  session_package: string | null;
  patient: string;
  amount: string;
  payment_method: PaymentMethod;
  paid_at: string;
  notes: string;
  receipt_number: string;
  receipt_url: string | null;
  receipt_generated_at: string | null;
  created_at: string;
}

export interface PaymentCreate {
  appointment?: string;
  session_package?: string;
  patient: string;
  amount: number;
  payment_method: PaymentMethod;
  paid_at: string;
  notes?: string;
}

export interface CaixaData {
  payments: CaixaPaymentRow[];
  total: string;
  by_method: { payment_method: PaymentMethod; total: string; count: number }[];
}

export interface CaixaPaymentRow {
  id: string;
  receipt_number: string;
  patient__name: string;
  amount: string;
  payment_method: PaymentMethod;
  paid_at: string;
  notes: string;
}

export interface FinancialDashboard {
  revenue_today: string;
  revenue_month: string;
  appointments_today: number;
  appointments_month: number;
  average_ticket: string;
  top_payment_method: PaymentMethod | null;
  by_method: { payment_method: PaymentMethod; total: string; count: number }[];
  daily_revenue: { date: string; total: string }[];
}
