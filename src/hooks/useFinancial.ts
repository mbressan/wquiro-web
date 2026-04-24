import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Payment, PaymentCreate, CaixaData, FinancialDashboard } from '@/types/financial';

export const PAYMENTS_KEY = 'payments';
export const CAIXA_KEY = 'caixa';
export const FINANCIAL_DASHBOARD_KEY = 'financial-dashboard';

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation<Payment, unknown, PaymentCreate>({
    mutationFn: (data) => api.post('/financeiro/pagamentos/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [CAIXA_KEY] });
      qc.invalidateQueries({ queryKey: [FINANCIAL_DASHBOARD_KEY] });
    },
  });
}

export function usePayments(params?: Record<string, string>) {
  return useQuery<{ results: Payment[]; count: number }>({
    queryKey: [PAYMENTS_KEY, params],
    queryFn: () => api.get('/financeiro/pagamentos/', { params }).then((r) => r.data),
  });
}

export function useCaixa(params: { periodo: 'diario' | 'mensal'; date?: string; month?: string }) {
  return useQuery<CaixaData>({
    queryKey: [CAIXA_KEY, params],
    queryFn: () => api.get('/financeiro/caixa/', { params }).then((r) => r.data),
  });
}

export function useFinancialDashboard() {
  return useQuery<FinancialDashboard>({
    queryKey: [FINANCIAL_DASHBOARD_KEY],
    queryFn: () => api.get('/financeiro/dashboard/').then((r) => r.data),
  });
}

export function usePaymentReceipt(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/financeiro/pagamentos/${id}/recibo/`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PAYMENTS_KEY] }),
  });
}
