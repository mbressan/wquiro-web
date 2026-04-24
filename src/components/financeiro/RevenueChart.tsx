import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: { date: string; total: string }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    total: parseFloat(d.total),
  }));

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Receita Diária (Mês Atual)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
          <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
          <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
