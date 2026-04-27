import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer, PageHeaderBack, SkeletonPage } from '@/components/ui'
import { usePosturalHistorico } from '@/hooks/usePosturalHistorico'
import { PosturalComparisonView } from '@/components/prontuario/postural/PosturalComparisonView'
import type { PosturalHistoricoItem } from '@/types/posture'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function recordTypeLabel(type: PosturalHistoricoItem['record_type']): string {
  return type === 'anamnesis' ? 'Anamnese' : 'Reavaliação'
}

export default function PosturalHistoricoPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { data: historico, isLoading, isError } = usePosturalHistorico(patientId!)

  const [baselineId, setBaselineId] = useState<string | null>(null)
  const [currentId, setCurrentId] = useState<string | null>(null)

  if (isLoading) return <SkeletonPage />

  if (isError) {
    return <div className="p-8 text-center text-red-500">Erro ao carregar histórico postural.</div>
  }

  if (!historico || historico.length === 0) {
    return (
      <PageContainer>
        <PageHeaderBack title="Histórico Postural" onBack={() => navigate(-1)} />
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center text-gray-400">
          Nenhuma avaliação postural registrada para este paciente.
        </div>
      </PageContainer>
    )
  }

  const first = historico[0]
  const last = historico[historico.length - 1]

  const resolvedBaselineId = baselineId ?? first.clinical_record_id
  const resolvedCurrentId = currentId ?? (historico.length > 1 ? last.clinical_record_id : first.clinical_record_id)

  const baselineItem = historico.find((h) => h.clinical_record_id === resolvedBaselineId) ?? first
  const currentItem = historico.find((h) => h.clinical_record_id === resolvedCurrentId) ?? last

  return (
    <PageContainer>
      <PageHeaderBack
        title="Histórico Postural"
        onBack={() => navigate(-1)}
        badge={
          <span className="text-sm text-gray-500">
            {historico.length} avaliação{historico.length !== 1 ? 'ões' : ''}
          </span>
        }
      />

      {/* Cronologia */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Avaliações</h2>
        <div className="space-y-2">
          {historico.map((item) => (
            <div
              key={item.clinical_record_id}
              className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 hover:bg-gray-50"
            >
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-800">
                  {formatDate(item.appointment_date)}
                </span>
                <span className="ml-2 text-xs text-gray-400">{recordTypeLabel(item.record_type)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBaselineId(item.clinical_record_id)}
                  className={[
                    'rounded px-2 py-1 text-xs font-medium transition-colors',
                    resolvedBaselineId === item.clinical_record_id
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ].join(' ')}
                >
                  Inicial
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentId(item.clinical_record_id)}
                  className={[
                    'rounded px-2 py-1 text-xs font-medium transition-colors',
                    resolvedCurrentId === item.clinical_record_id
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100',
                  ].join(' ')}
                >
                  Atual
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparação */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Comparação Evolutiva</h2>
        <PosturalComparisonView
          baseline={baselineItem}
          current={historico.length > 1 ? currentItem : undefined}
        />
      </div>
    </PageContainer>
  )
}
