import { useState } from 'react'
import { Download, Printer, Share2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePatientRecords } from '@/hooks/useRecords'
import type { ClinicalRecordListItem, RecordType } from '@/types/record'

interface DiagnosticsSectionProps {
  patientId: string
  currentRecordId: string
}

const TYPE_LABELS: Record<RecordType, string> = {
  anamnesis: 'Anamnese',
  follow_up: 'Retorno',
  reevaluation: 'Reavaliação',
  discharge: 'Alta',
}

function RecordTypeBadge({ type }: { type: RecordType }) {
  return (
    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
      {TYPE_LABELS[type]}
    </span>
  )
}

function formatDate(date: string): string {
  try {
    return format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return date
  }
}

type FilterType = 'all' | RecordType

export function DiagnosticsSection({ patientId, currentRecordId }: DiagnosticsSectionProps) {
  const { data: records = [] } = usePatientRecords(patientId)
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = records
    .filter((r: ClinicalRecordListItem) => r.id !== currentRecordId)
    .filter((r: ClinicalRecordListItem) => filter === 'all' || r.record_type === filter)
    .slice(0, 5)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Últimos diagnósticos</h3>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as FilterType)}
          className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
        >
          <option value="all">Todos</option>
          <option value="anamnesis">Anamnese</option>
          <option value="follow_up">Retorno</option>
          <option value="reevaluation">Reavaliação</option>
          <option value="discharge">Alta</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-6 text-gray-400 text-sm">Nenhum registro anterior</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r: ClinicalRecordListItem) => (
            <div key={r.id} className="flex items-start justify-between gap-2 p-3 rounded-lg border border-gray-100">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 flex-wrap">
                  <span>{formatDate(r.date)}</span>
                  <RecordTypeBadge type={r.record_type} />
                  <span>{r.professional_name}</span>
                </div>
                <p className="text-sm text-gray-700 truncate">{r.soap_summary || 'Sem resumo'}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button title="Baixar PDF" onClick={() => window.print()} className="p-1 text-gray-400 hover:text-gray-600">
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button title="Imprimir" onClick={() => window.print()} className="p-1 text-gray-400 hover:text-gray-600">
                  <Printer className="h-3.5 w-3.5" />
                </button>
                <button
                  title="Compartilhar"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
