export interface HomeKPIs {
  revenue_month: string
  revenue_today: string
  appointments_today: number
  appointments_month: number
  new_patients_month: number
  active_patients: number
  no_show_rate_month: string
  avg_ticket_month: string
}

export interface ByDayData {
  date: string
  appointments: number
  completed: number
  no_shows: number
}

export interface OperacionalData {
  period: string
  date: string
  total_appointments: number
  completed: number
  no_show: number
  cancelled: number
  no_show_rate: string
  occupancy_rate: string | null
  new_patients: number
  returning_patients: number
  new_vs_returning_ratio: string
  by_day: ByDayData[]
  warning: string | null
}

export interface ProfessionalMetric {
  id: string
  name: string
  total: number
  completed: number
  no_show: number
  no_show_rate: string
  revenue: string
  avg_ticket: string
}

export interface OperacionalPorProfissionalData {
  period: string
  professionals: ProfessionalMetric[]
}

export interface FinanceiroData {
  period: string
  date: string
  revenue_total: string
  revenue_goal: string | null
  avg_ticket: string
  revenue_by_day: { date: string; amount: string }[]
  revenue_by_method: Record<string, string>
  revenue_by_professional: { id: string; name: string; amount: string }[]
}

export interface RetencaoData {
  period: string
  active_patients: number
  churned_this_month: number
  reactivated_this_month: number
  churn_rate: string
  new_patients: number
  returning_rate: string
  churn_30d: number
  churn_60d: number
  avg_sessions_per_patient: string
  avg_days_between_appointments: number
}

export interface ExportRequest {
  type: 'financeiro' | 'operacional'
  period: 'month' | 'year' | 'quarter' | 'week'
  date: string
  format: 'pdf' | 'xlsx'
}

export interface TaskStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  download_url: string | null
  error: string | null
}

export type PeriodOption = 'this_month' | 'last_month' | 'last_3_months' | 'this_year'

export interface PeriodValue {
  preset: PeriodOption
  period: 'month' | 'year' | 'quarter' | 'week'
  date: string // YYYY-MM
}
