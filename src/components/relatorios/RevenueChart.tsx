import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { date: string; amount: string }[]
  period: 'week' | 'month' | 'year'
}

export function RevenueChart({ data, period }: Props) {
  if (data.length < 2) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Dados insuficientes para o período selecionado.
      </p>
    )
  }

  const chartData = data.map((d) => ({
    date: d.date,
    value: parseFloat(d.amount),
    label: period === 'year' ? d.date.substring(0, 7) : d.date,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData}>
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(v) => [
            `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            'Receita',
          ]}
        />
        <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f120" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
