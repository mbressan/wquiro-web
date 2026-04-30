import { useState } from 'react'
import { format } from 'date-fns'
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
  UserMinus,
  UserCheck,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/ui'
import { CardWithHeader } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/authStore'
import { KPICard } from '@/components/relatorios/KPICard'
import { RevenueChart } from '@/components/relatorios/RevenueChart'
import { AppointmentStatusChart } from '@/components/relatorios/AppointmentStatusChart'
import { ByMethodChart } from '@/components/relatorios/ByMethodChart'
import { ProfessionalMetricsTable } from '@/components/relatorios/ProfessionalMetricsTable'
import { PeriodSelector } from '@/components/relatorios/PeriodSelector'
import {
  useOperacional,
  useOperacionalPorProfissional,
  useFinanceiro,
  useRetencao,
  useExportReport,
  useTaskStatus,
} from '@/hooks/useRelatorios'
import type { PeriodOption, PeriodValue } from '@/types/relatorios'

type TabId = 'operacional' | 'financeiro' | 'retencao'

function resolveInitialPeriod(): PeriodValue {
  return {
    preset: 'this_month',
    period: 'month',
    date: format(new Date(), 'yyyy-MM'),
  }
}

// ─── Tab button ───────────────────────────────────────────────────────────────
interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
        active
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 hover:bg-gray-100',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

// ─── Tab: Operacional ─────────────────────────────────────────────────────────
interface OperacionalTabProps {
  period: string
  date: string
}

function OperacionalTab({ period, date }: OperacionalTabProps) {
  const { data: op, isLoading: loadingOp } = useOperacional(period, date)
  const { data: prof, isLoading: loadingProf } = useOperacionalPorProfissional(period, date)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          title="Total de consultas"
          value={op?.total_appointments ?? 0}
          icon={CalendarDays}
          loading={loadingOp}
          format="number"
        />
        <KPICard
          title="Concluídas"
          value={op?.completed ?? 0}
          icon={CheckCircle}
          loading={loadingOp}
          format="number"
        />
        <KPICard
          title="Faltas"
          value={op?.no_show ?? 0}
          icon={XCircle}
          loading={loadingOp}
          format="number"
        />
        <KPICard
          title="Taxa de falta"
          value={op?.no_show_rate ?? '0'}
          icon={AlertCircle}
          loading={loadingOp}
          format="percent"
        />
      </div>

      {op?.warning && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          {op.warning}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardWithHeader title="Status das consultas">
          {loadingOp ? (
            <div className="h-[200px] animate-pulse bg-gray-100 rounded-lg" />
          ) : (
            <AppointmentStatusChart
              completed={op?.completed ?? 0}
              no_show={op?.no_show ?? 0}
              cancelled={op?.cancelled ?? 0}
            />
          )}
        </CardWithHeader>

        <CardWithHeader title="Novos vs. recorrentes">
          <div className="flex gap-6 py-4">
            <div className="flex-1 text-center">
              <p className="text-3xl font-semibold text-gray-900">{op?.new_patients ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Novos pacientes</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="flex-1 text-center">
              <p className="text-3xl font-semibold text-gray-900">{op?.returning_patients ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Recorrentes</p>
            </div>
          </div>
          {op?.occupancy_rate && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              Taxa de ocupação: {op.occupancy_rate}%
            </p>
          )}
        </CardWithHeader>
      </div>

      <CardWithHeader title="Por profissional">
        {loadingProf ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse bg-gray-100 rounded" />
            ))}
          </div>
        ) : (
          <ProfessionalMetricsTable data={prof?.professionals ?? []} />
        )}
      </CardWithHeader>
    </div>
  )
}

// ─── Tab: Financeiro ──────────────────────────────────────────────────────────
interface FinanceiroTabProps {
  period: string
  date: string
}

function FinanceiroTab({ period, date }: FinanceiroTabProps) {
  const { data: fin, isLoading } = useFinanceiro(period, date)

  const chartPeriod: 'week' | 'month' | 'year' =
    period === 'year' ? 'year' : period === 'week' ? 'week' : 'month'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KPICard
          title="Receita total"
          value={fin?.revenue_total ?? '0'}
          icon={DollarSign}
          loading={isLoading}
          format="currency"
        />
        <KPICard
          title="Ticket médio"
          value={fin?.avg_ticket ?? '0'}
          icon={TrendingUp}
          loading={isLoading}
          format="currency"
        />
        {fin?.revenue_goal && (
          <KPICard
            title="Meta de receita"
            value={fin.revenue_goal}
            icon={TrendingUp}
            loading={isLoading}
            format="currency"
          />
        )}
      </div>

      <CardWithHeader title="Receita ao longo do tempo">
        {isLoading ? (
          <div className="h-[200px] animate-pulse bg-gray-100 rounded-lg" />
        ) : (
          <RevenueChart data={fin?.revenue_by_day ?? []} period={chartPeriod} />
        )}
      </CardWithHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardWithHeader title="Receita por método de pagamento">
          {isLoading ? (
            <div className="h-[160px] animate-pulse bg-gray-100 rounded-lg" />
          ) : (
            <ByMethodChart data={fin?.revenue_by_method ?? {}} />
          )}
        </CardWithHeader>

        <CardWithHeader title="Receita por profissional">
          {isLoading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse bg-gray-100 rounded" />
              ))}
            </div>
          ) : fin?.revenue_by_professional && fin.revenue_by_professional.length > 0 ? (
            <div className="space-y-2 py-1">
              {fin.revenue_by_professional.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="font-medium text-gray-900">
                    R$ {Number(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Sem dados no período.</p>
          )}
        </CardWithHeader>
      </div>
    </div>
  )
}

// ─── Tab: Retenção ────────────────────────────────────────────────────────────
interface RetencaoTabProps {
  period: string
  date: string
}

function RetencaoTab({ period, date }: RetencaoTabProps) {
  const { data: ret, isLoading } = useRetencao(period, date)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          title="Pacientes ativos"
          value={ret?.active_patients ?? 0}
          icon={Users}
          loading={isLoading}
          format="number"
        />
        <KPICard
          title="Churn (mês)"
          value={ret?.churned_this_month ?? 0}
          icon={UserMinus}
          loading={isLoading}
          format="number"
        />
        <KPICard
          title="Reativados"
          value={ret?.reactivated_this_month ?? 0}
          icon={UserCheck}
          loading={isLoading}
          format="number"
        />
        <KPICard
          title="Taxa de churn"
          value={ret?.churn_rate ?? '0'}
          icon={AlertCircle}
          loading={isLoading}
          format="percent"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardWithHeader title="Pacientes novos vs. retorno">
          <div className="flex gap-6 py-4">
            <div className="flex-1 text-center">
              <p className="text-3xl font-semibold text-gray-900">{ret?.new_patients ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Novos</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="flex-1 text-center">
              <p className="text-3xl font-semibold text-primary-600">{ret?.returning_rate ?? '0'}%</p>
              <p className="text-sm text-gray-500 mt-1">Taxa de retorno</p>
            </div>
          </div>
        </CardWithHeader>

        <CardWithHeader title="Métricas de engajamento">
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Sessões médias por paciente</span>
              <span className="font-medium text-gray-900">{ret?.avg_sessions_per_patient ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Dias entre consultas (média)</span>
              <span className="font-medium text-gray-900">{ret?.avg_days_between_appointments ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Churn 30 dias</span>
              <span className="font-medium text-gray-900">{ret?.churn_30d ?? 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Churn 60 dias</span>
              <span className="font-medium text-gray-900">{ret?.churn_60d ?? 0}</span>
            </div>
          </div>
        </CardWithHeader>
      </div>
    </div>
  )
}

// ─── Export button ────────────────────────────────────────────────────────────
interface ExportButtonProps {
  activeTab: TabId
  period: PeriodValue
}

function ExportButton({ activeTab, period }: ExportButtonProps) {
  const exportMutation = useExportReport()
  const [taskId, setTaskId] = useState<string | null>(null)
  const { data: taskStatus } = useTaskStatus(taskId)

  // React to task completion
  useState(() => {
    if (taskStatus?.status === 'completed' && taskStatus.download_url) {
      window.open(taskStatus.download_url, '_blank')
      toast.success('Relatório pronto! Download iniciado.')
      setTaskId(null)
    } else if (taskStatus?.status === 'failed') {
      toast.error(taskStatus.error ?? 'Falha ao gerar relatório.')
      setTaskId(null)
    }
  })

  const canExport = activeTab === 'operacional' || activeTab === 'financeiro'
  if (!canExport) return null

  const isPending =
    exportMutation.isPending ||
    taskStatus?.status === 'pending' ||
    taskStatus?.status === 'processing'

  async function handleExport() {
    try {
      const result = await exportMutation.mutateAsync({
        type: activeTab as 'financeiro' | 'operacional',
        period: period.period,
        date: period.date,
        format: 'xlsx',
      })
      setTaskId(result.task_id)
      toast.info('Gerando relatório...')
    } catch {
      toast.error('Erro ao solicitar exportação.')
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      {isPending ? 'Gerando...' : 'Exportar'}
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RelatoriosPage() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'

  const [activeTab, setActiveTab] = useState<TabId>('operacional')
  const [periodValue, setPeriodValue] = useState<PeriodValue>(resolveInitialPeriod())

  // If non-admin lands on a restricted tab, redirect to operacional
  function handleTabChange(tab: TabId) {
    if ((tab === 'financeiro' || tab === 'retencao') && !isAdmin) return
    setActiveTab(tab)
  }

  function handlePeriodChange(v: PeriodValue) {
    setPeriodValue(v)
  }

  return (
    <PageContainer size="xl">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Relatórios</h1>
        <div className="flex items-center gap-3">
          <PeriodSelector
            value={periodValue.preset as PeriodOption}
            onChange={handlePeriodChange}
          />
          <ExportButton activeTab={activeTab} period={periodValue} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <TabButton active={activeTab === 'operacional'} onClick={() => handleTabChange('operacional')}>
          Operacional
        </TabButton>
        {isAdmin && (
          <>
            <TabButton active={activeTab === 'financeiro'} onClick={() => handleTabChange('financeiro')}>
              Financeiro
            </TabButton>
            <TabButton active={activeTab === 'retencao'} onClick={() => handleTabChange('retencao')}>
              Retenção
            </TabButton>
          </>
        )}
      </div>

      {/* Tab content */}
      {activeTab === 'operacional' && (
        <OperacionalTab period={periodValue.period} date={periodValue.date} />
      )}
      {activeTab === 'financeiro' && isAdmin && (
        <FinanceiroTab period={periodValue.period} date={periodValue.date} />
      )}
      {activeTab === 'retencao' && isAdmin && (
        <RetencaoTab period={periodValue.period} date={periodValue.date} />
      )}
    </PageContainer>
  )
}
