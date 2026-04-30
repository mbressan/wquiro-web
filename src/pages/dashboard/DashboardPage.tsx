import { Users, CalendarDays, DollarSign, TrendingUp, BarChart2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/ui'
import { CardWithHeader } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/authStore'
import { KPICard } from '@/components/relatorios/KPICard'
import { RevenueChart } from '@/components/relatorios/RevenueChart'
import { useHomeKPIs } from '@/hooks/useRelatorios'

export function DashboardPage() {
  const { data, isLoading } = useHomeKPIs()
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'

  // Build last-7-days revenue data from home-kpis if available (placeholder if missing)
  const revenueData = data
    ? [{ date: new Date().toISOString().substring(0, 10), amount: data.revenue_today }]
    : []

  return (
    <PageContainer size="xl">
      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          title="Pacientes ativos"
          value={data?.active_patients ?? 0}
          icon={Users}
          loading={isLoading}
          format="number"
          isStale={data?.isStale}
        />
        <KPICard
          title="Consultas hoje"
          value={data?.appointments_today ?? 0}
          icon={CalendarDays}
          loading={isLoading}
          format="number"
          isStale={data?.isStale}
        />
        <KPICard
          title="Receita do mês"
          value={data?.revenue_month ?? '0'}
          icon={DollarSign}
          loading={isLoading}
          format="currency"
          isStale={data?.isStale}
        />
        <KPICard
          title="Ticket médio"
          value={data?.avg_ticket_month ?? '0'}
          icon={TrendingUp}
          loading={isLoading}
          format="currency"
          isStale={data?.isStale}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Agenda de hoje */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Agenda de hoje</h2>
            <Link to="/agenda" className="text-xs font-medium text-primary-600 hover:underline">
              Ver agenda completa →
            </Link>
          </div>
          <div className="px-5 py-2">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarDays className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Conecte a API para ver as consultas de hoje</p>
              <Link
                to="/agenda"
                className="mt-3 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700"
              >
                Ir para Agenda
              </Link>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Ações rápidas</h2>
          </div>
          <div className="p-4 space-y-2">
            <Link
              to="/agenda"
              className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
            >
              <CalendarDays className="h-4 w-4 text-primary-600" />
              Nova consulta
            </Link>
            <Link
              to="/pacientes"
              className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
            >
              <Users className="h-4 w-4 text-primary-600" />
              Cadastrar paciente
            </Link>
            <Link
              to="/financeiro/caixa"
              className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
            >
              <DollarSign className="h-4 w-4 text-primary-600" />
              Registrar pagamento
            </Link>
            {isAdmin && (
              <Link
                to="/relatorios"
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
              >
                <BarChart2 className="h-4 w-4 text-primary-600" />
                Ver relatórios
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mini revenue chart — admin only */}
      {isAdmin && revenueData.length > 1 && (
        <CardWithHeader title="Receita (últimos dias)" action={
          <Link to="/relatorios" className="text-xs font-medium text-primary-600 hover:underline">
            Ver relatório completo →
          </Link>
        }>
          <RevenueChart data={revenueData} period="week" />
        </CardWithHeader>
      )}
    </PageContainer>
  )
}
