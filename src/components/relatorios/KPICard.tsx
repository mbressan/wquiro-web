import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  loading?: boolean
  format?: 'currency' | 'number' | 'percent'
  isStale?: boolean
}

function formatValue(value: string | number, format?: 'currency' | 'number' | 'percent'): string {
  if (format === 'currency') {
    return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }
  if (format === 'percent') {
    return `${value}%`
  }
  return String(value)
}

export function KPICard({ title, value, change, icon: Icon, loading, format, isStale }: KPICardProps) {
  return (
    <Card className="relative">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{title}</p>
          <div className="mt-1.5">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-semibold text-gray-900">{formatValue(value, format)}</p>
            )}
          </div>
          {change !== undefined && !loading && (
            <p className={['mt-1 text-xs font-medium', change >= 0 ? 'text-emerald-600' : 'text-red-500'].join(' ')}>
              {change >= 0 ? '+' : ''}{change}% vs. período anterior
            </p>
          )}
          {isStale && (
            <span className="mt-1 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
              Atualizando...
            </span>
          )}
        </div>
        <div className="ml-3 rounded-lg bg-primary-50 p-2.5 shrink-0">
          <Icon className="h-5 w-5 text-primary-600" />
        </div>
      </div>
    </Card>
  )
}
