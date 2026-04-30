import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props {
  completed: number
  no_show: number
  cancelled: number
}

const COLORS = {
  completed: '#22c55e',
  no_show: '#f59e0b',
  cancelled: '#ef4444',
}

const LABELS = {
  completed: 'Concluídas',
  no_show: 'Faltas',
  cancelled: 'Canceladas',
}

export function AppointmentStatusChart({ completed, no_show, cancelled }: Props) {
  if (completed === 0 && no_show === 0 && cancelled === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Nenhuma consulta no período selecionado.
      </p>
    )
  }

  const data = [
    { name: LABELS.completed, value: completed, color: COLORS.completed },
    { name: LABELS.no_show, value: no_show, color: COLORS.no_show },
    { name: LABELS.cancelled, value: cancelled, color: COLORS.cancelled },
  ].filter((d) => d.value > 0)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [value, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
