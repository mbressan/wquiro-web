import { Users, CalendarDays, DollarSign, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/ui'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  trend?: string
  trendUp?: boolean
  color: string
}

function StatCard({ label, value, icon: Icon, trend, trendUp, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className={['mt-1 text-xs', trendUp ? 'text-emerald-600' : 'text-red-500'].join(' ')}>
              {trend}
            </p>
          )}
        </div>
        <div className={['rounded-lg p-2.5', color].join(' ')}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  return (
    <PageContainer size="xl">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pacientes ativos"
          value="—"
          icon={Users}
          color="bg-primary-600"
        />
        <StatCard
          label="Consultas hoje"
          value="—"
          icon={CalendarDays}
          color="bg-violet-500"
        />
        <StatCard
          label="Receita do mês"
          value="—"
          icon={DollarSign}
          color="bg-emerald-500"
        />
        <StatCard
          label="Taxa de comparecimento"
          value="—"
          icon={TrendingUp}
          color="bg-amber-500"
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
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
