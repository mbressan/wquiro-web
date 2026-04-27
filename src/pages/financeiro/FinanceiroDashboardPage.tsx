import { useFinancialDashboard } from '@/hooks/useFinancial';
import { RevenueChart } from '@/components/financeiro/RevenueChart';
import { PageHeader, PageContainer } from '@/components/ui';

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
}

function KPICard({ label, value, sub }: KPICardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

const METHOD_LABELS: Record<string, string> = {
  pix: 'PIX', credit_card: 'Cartão Crédito', debit_card: 'Cartão Débito',
  cash: 'Dinheiro', bank_slip: 'Boleto',
};

export default function FinanceiroDashboardPage() {
  const { data, isLoading } = useFinancialDashboard();

  if (isLoading) return <div className="p-8 text-center text-gray-400">Carregando...</div>;
  if (!data) return null;

  return (
    <PageContainer>
      <PageHeader title="Dashboard Financeiro" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard label="Receita Hoje" value={`R$ ${Number(data.revenue_today).toFixed(2)}`} />
        <KPICard label="Receita do Mês" value={`R$ ${Number(data.revenue_month).toFixed(2)}`} />
        <KPICard label="Consultas Hoje" value={data.appointments_today} />
        <KPICard label="Consultas do Mês" value={data.appointments_month} />
        <KPICard
          label="Ticket Médio"
          value={`R$ ${Number(data.average_ticket).toFixed(2)}`}
        />
        <KPICard
          label="Principal Método"
          value={data.top_payment_method ? (METHOD_LABELS[data.top_payment_method] ?? data.top_payment_method) : '—'}
        />
      </div>

      <RevenueChart data={data.daily_revenue} />

      {data.by_method.length > 0 && (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Receita por Método</h3>
          <div className="space-y-2">
            {data.by_method.map((m) => (
              <div key={m.payment_method} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{METHOD_LABELS[m.payment_method] ?? m.payment_method}</span>
                <div className="flex gap-4">
                  <span className="text-gray-500">{m.count} pag.</span>
                  <span className="font-semibold text-green-700">R$ {m.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
