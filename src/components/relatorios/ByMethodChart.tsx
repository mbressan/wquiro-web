import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  data: Record<string, string>
}

const METHOD_LABELS: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão Crédito',
  debit_card: 'Cartão Débito',
  cash: 'Dinheiro',
  bank_slip: 'Boleto',
}

const BAR_COLOR = '#6366f1'

export function ByMethodChart({ data }: Props) {
  const chartData = Object.entries(data)
    .map(([method, amount]) => ({
      method: METHOD_LABELS[method] ?? method,
      amount: parseFloat(amount),
    }))
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Nenhuma receita registrada no período.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(chartData.length * 44, 120)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 32 }}>
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
        />
        <YAxis type="category" dataKey="method" tick={{ fontSize: 11 }} width={100} />
        <Tooltip
          formatter={(v) => [
            `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            'Receita',
          ]}
        />
        <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
          {chartData.map((_, index) => (
            <Cell key={index} fill={BAR_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
