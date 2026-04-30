import { format, subMonths } from 'date-fns'
import { Select } from '@/components/ui/Input'
import type { PeriodOption, PeriodValue } from '@/types/relatorios'

interface Props {
  value: PeriodOption
  onChange: (v: PeriodValue) => void
}

function resolvePeriod(preset: PeriodOption): PeriodValue {
  const now = new Date()
  switch (preset) {
    case 'this_month':
      return { preset, period: 'month', date: format(now, 'yyyy-MM') }
    case 'last_month':
      return { preset, period: 'month', date: format(subMonths(now, 1), 'yyyy-MM') }
    case 'last_3_months':
      return { preset, period: 'quarter', date: format(now, 'yyyy-MM') }
    case 'this_year':
      return { preset, period: 'year', date: format(now, 'yyyy') }
  }
}

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(resolvePeriod(e.target.value as PeriodOption))}
      className="w-44"
    >
      <option value="this_month">Este mês</option>
      <option value="last_month">Mês anterior</option>
      <option value="last_3_months">Últimos 3 meses</option>
      <option value="this_year">Este ano</option>
    </Select>
  )
}
