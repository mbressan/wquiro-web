import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { CalendarDays, CheckCircle, UserCheck, UserX } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts'
import { TodayPanelContext } from '@/layouts/DashboardLayout'
import { AppointmentDetailCard } from '@/components/agenda/AppointmentDetailCard'
import { KPICard } from '@/components/relatorios/KPICard'
import { useDashboardKPIs } from '@/hooks/useRelatorios'
import { useProfessionals } from '@/hooks/useProfessionals'
import type { HomePeriodOption, ChartDataPoint, DurationDataPoint } from '@/types/relatorios'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function PieChartCard({
  title,
  data,
  isLoading,
  innerRadius = 0,
}: {
  title: string
  data?: ChartDataPoint[]
  isLoading: boolean
  innerRadius?: number
}) {
  const filtered = (data ?? []).filter(d => d.value > 0)
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-2 text-xs font-semibold text-gray-700">{title}</h3>
      {isLoading ? (
        <div className="h-32 w-full animate-pulse rounded bg-gray-100" />
      ) : filtered.length === 0 ? (
        <p className="text-xs text-center text-gray-400 mt-8">Sem dados no período</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={filtered}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={60}
              dataKey="value"
              paddingAngle={2}
            >
              {filtered.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function DurationBarCard({
  title,
  data,
  isLoading,
}: {
  title: string
  data?: DurationDataPoint[]
  isLoading: boolean
}) {
  const filtered = (data ?? []).filter(d => d.avg_minutes > 0)
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-2 text-xs font-semibold text-gray-700">{title}</h3>
      {isLoading ? (
        <div className="h-32 w-full animate-pulse rounded bg-gray-100" />
      ) : filtered.length === 0 ? (
        <p className="text-xs text-center text-gray-400 mt-8">Sem dados no período</p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={filtered} margin={{ top: 4, right: 8, left: 0, bottom: 24 }}>
            <XAxis
              dataKey="appointment_type"
              tick={{ fontSize: 9 }}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 9 }} unit=" min" width={40} />
            <Tooltip formatter={(v) => [`${Number(v)} min`, 'Duração média']} />
            <Bar dataKey="avg_minutes" radius={[4, 4, 0, 0]}>
              {filtered.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { selectedAppt, setSelectedAppt } = useContext(TodayPanelContext)
  const [period, setPeriod] = useState<HomePeriodOption>('last_30_days')
  const [professionalId, setProfessionalId] = useState<string | undefined>()

  const { data, isLoading } = useDashboardKPIs(period, professionalId)
  const { data: profs } = useProfessionals()

  if (selectedAppt) {
    return (
      <div className="p-6">
        <button
          onClick={() => setSelectedAppt(null)}
          className="mb-4 text-sm text-primary-600 hover:underline"
        >
          ← Voltar ao dashboard
        </button>
        <AppointmentDetailCard
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Filtros */}
      <div className="flex items-center gap-3">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as HomePeriodOption)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        >
          <option value="today">Hoje</option>
          <option value="last_7_days">Últimos 7 dias</option>
          <option value="last_30_days">Últimos 30 dias</option>
          <option value="this_month">Este mês</option>
          <option value="last_month">Mês anterior</option>
        </select>

        {profs && profs.length > 1 && (
          <select
            value={professionalId ?? ''}
            onChange={e => setProfessionalId(e.target.value || undefined)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos os profissionais</option>
            {profs.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard title="Agendados" value={data?.kpis.scheduled ?? 0} icon={CalendarDays} loading={isLoading} format="number" />
        <KPICard title="Confirmados" value={data?.kpis.confirmed ?? 0} icon={CheckCircle} loading={isLoading} format="number" />
        <KPICard title="Atendidos" value={data?.kpis.completed ?? 0} icon={UserCheck} loading={isLoading} format="number" />
        <KPICard title="Faltaram" value={data?.kpis.no_show ?? 0} icon={UserX} loading={isLoading} format="number" />
      </div>

      {/* Gráficos */}
      <div id="charts-section" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PieChartCard
          title="Pacientes"
          data={data?.charts.patients_by_type}
          isLoading={isLoading}
        />
        <PieChartCard
          title="Procedimentos"
          data={data?.charts.by_appointment_type}
          isLoading={isLoading}
          innerRadius={30}
        />
        <PieChartCard
          title="Por Convênio"
          data={data?.charts.by_convenio}
          isLoading={isLoading}
          innerRadius={30}
        />
        <DurationBarCard
          title="Duração Média"
          data={data?.charts.avg_duration_by_type}
          isLoading={isLoading}
        />
      </div>

      {/* Tabela de atendimentos */}
      <div id="table-section">
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Atendimentos no período</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="px-5 py-3 font-medium">Hora</th>
                  <th className="px-5 py-3 font-medium">Paciente</th>
                  <th className="px-5 py-3 font-medium">Profissional</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.appointments.map(appt => (
                  <tr
                    key={appt.id}
                    onClick={() => appt.clinical_record_id && navigate(`/prontuario/${appt.clinical_record_id}`)}
                    className={appt.clinical_record_id ? 'cursor-pointer hover:bg-gray-50' : ''}
                  >
                    <td className="px-5 py-3 text-xs text-gray-500 font-mono">
                      {format(new Date(appt.scheduled_at), 'HH:mm')}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{appt.patient_name}</td>
                    <td className="px-5 py-3 text-gray-600">{appt.professional_name}</td>
                    <td className="px-5 py-3 text-gray-600">{appt.appointment_type || '—'}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">{appt.status}</span>
                    </td>
                  </tr>
                ))}
                {!isLoading && !data?.appointments.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">Nenhum atendimento no período</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
