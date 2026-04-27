import { useState } from 'react';
import { toast } from 'sonner';
import { PaymentForm } from '@/components/financeiro/PaymentForm';
import { useCaixa, useCreatePayment } from '@/hooks/useFinancial';
import { PageHeader, Input, CardWithHeader, PageContainer, SkeletonTableRows } from '@/components/ui';
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
    <PageContainer>
      <PageHeader
        title="Caixa"
        actions={
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CardWithHeader title="Registrar Pagamento">
            <PaymentForm onSubmit={handleCreatePayment} isLoading={create.isPending} />
          </CardWithHeader>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Summary */}
          <CardWithHeader
            title="Resumo do Dia"
            action={<span className="text-lg font-bold text-emerald-700">R$ {data?.total ?? '0.00'}</span>}
          >
            <div className="flex flex-wrap gap-2">
              {(data?.by_method ?? []).map((m) => (
                <span key={m.payment_method} className="rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700">
                  {METHOD_LABELS[m.payment_method] ?? m.payment_method}: R$ {m.total} ({m.count}x)
                </span>
              ))}
            </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
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
                  <SkeletonTableRows rows={4} cols={4} />
                ) : (data?.payments ?? []).length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400">Nenhum pagamento hoje.</td></tr>
                ) : (
                  (data?.payments ?? []).map((p: CaixaPaymentRow) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{p.receipt_number}</td>
                      <td className="px-4 py-3 font-medium">{p.patient__name}</td>
                      <td className="px-4 py-3 text-gray-600">{METHOD_LABELS[p.payment_method] ?? p.payment_method}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">R$ {p.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </CardWithHeader>
        </div>
      </div>
    </PageContainer>
  );
}
