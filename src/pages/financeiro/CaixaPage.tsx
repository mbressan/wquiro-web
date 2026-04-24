import { useState } from 'react';
import { toast } from 'sonner';
import { PaymentForm } from '@/components/financeiro/PaymentForm';
import { useCaixa, useCreatePayment } from '@/hooks/useFinancial';
import type { CaixaPaymentRow } from '@/types/financial';

const METHOD_LABELS: Record<string, string> = {
  pix: 'PIX', credit_card: 'Cartão Crédito', debit_card: 'Cartão Débito',
  cash: 'Dinheiro', bank_slip: 'Boleto',
};

export default function CaixaPage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const { data, isLoading } = useCaixa({ periodo: 'diario', date });
  const create = useCreatePayment();

  function handleCreatePayment(formData: Parameters<typeof create.mutate>[0]) {
    create.mutate(formData, {
      onSuccess: () => toast.success('Pagamento registrado!'),
      onError: (e: unknown) => {
        const err = e as { response?: { data?: { appointment?: string[] } } };
        const msg = err?.response?.data?.appointment?.[0] ?? 'Erro ao registrar pagamento.';
        toast.error(msg);
      },
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Caixa</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Registrar Pagamento</h2>
          <PaymentForm onSubmit={handleCreatePayment} isLoading={create.isPending} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Summary */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Resumo do Dia</h2>
              <span className="text-lg font-bold text-green-700">R$ {data?.total ?? '0.00'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data?.by_method ?? []).map((m) => (
                <span key={m.payment_method} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                  {METHOD_LABELS[m.payment_method] ?? m.payment_method}: R$ {m.total} ({m.count}x)
                </span>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Recibo</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Paciente</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Método</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400">Carregando...</td></tr>
                ) : (data?.payments ?? []).length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400">Nenhum pagamento hoje.</td></tr>
                ) : (
                  (data?.payments ?? []).map((p: CaixaPaymentRow) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{p.receipt_number}</td>
                      <td className="px-4 py-3 font-medium">{p.patient__name}</td>
                      <td className="px-4 py-3 text-gray-600">{METHOD_LABELS[p.payment_method] ?? p.payment_method}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">R$ {p.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
