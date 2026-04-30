import type { ProfessionalMetric } from '@/types/relatorios'

interface Props {
  data: ProfessionalMetric[]
}

function fmtCurrency(value: string): string {
  return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

export function ProfessionalMetricsTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        Nenhum profissional com dados no período.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Nome
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Consultas
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Concluídas
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Faltas
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Taxa Falta
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Receita
            </th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Ticket Médio
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((prof) => (
            <tr key={prof.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2.5 font-medium text-gray-900">{prof.name}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">{prof.total}</td>
              <td className="px-3 py-2.5 text-right text-emerald-600">{prof.completed}</td>
              <td className="px-3 py-2.5 text-right text-amber-600">{prof.no_show}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">{prof.no_show_rate}%</td>
              <td className="px-3 py-2.5 text-right text-gray-700">{fmtCurrency(prof.revenue)}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">{fmtCurrency(prof.avg_ticket)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
