import { usePosturalHistorico } from '@/hooks/usePosturalHistorico'
import { Skeleton } from '@/components/ui'
import type { PosturalAssessment, SeverityLevel } from '@/types/posture'
import { SEVERITY_CONFIG } from '@/lib/posture-constants'

interface PosturalSummaryCardProps {
  patientId: string
  onClick?: () => void
}

function countBySeverity(assessment: PosturalAssessment): Record<SeverityLevel, number> {
  const counts: Record<SeverityLevel, number> = { 1: 0, 2: 0, 3: 0 }
  const views = [assessment.anterior, assessment.posterior, assessment.lateral_right, assessment.lateral_left]
  for (const view of views) {
    for (const lm of view.landmarks) {
      counts[lm.severity] = (counts[lm.severity] ?? 0) + 1
    }
  }
  return counts
}

function getSevereItems(assessment: PosturalAssessment): string[] {
  const items: string[] = []
  const views = [assessment.anterior, assessment.posterior, assessment.lateral_right, assessment.lateral_left]
  for (const view of views) {
    for (const lm of view.landmarks) {
      if (lm.severity === 3) {
        items.push(lm.name)
      }
    }
  }
  return [...new Set(items)]
}

export function PosturalSummaryCard({ patientId, onClick }: PosturalSummaryCardProps) {
  const { data: historico, isLoading } = usePosturalHistorico(patientId)

  const latest = historico && historico.length > 0 ? historico[historico.length - 1] : null
  const assessment = latest?.posture_assessment ?? null

  const counts = assessment ? countBySeverity(assessment) : null
  const severeItems = assessment ? getSevereItems(assessment) : []

  return (
    <div
      className={[
        'rounded-xl border bg-white p-4 shadow-sm',
        onClick ? 'cursor-pointer hover:border-blue-300 transition-colors' : '',
      ].join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <h3 className="text-sm font-semibold text-gray-800 mb-2">Avaliação Postural</h3>

      {isLoading ? (
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      ) : assessment === null ? (
        <p className="text-xs text-gray-400">Nenhuma avaliação postural registrada</p>
      ) : (
        <div className="space-y-2">
          {/* Contagem por severidade */}
          <div className="flex gap-2 flex-wrap">
            {counts && counts[3] > 0 && (
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${SEVERITY_CONFIG[3].badgeVariant}`}>
                {counts[3]} severo{counts[3] > 1 ? 's' : ''}
              </span>
            )}
            {counts && counts[2] > 0 && (
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${SEVERITY_CONFIG[2].badgeVariant}`}>
                {counts[2]} moderado{counts[2] > 1 ? 's' : ''}
              </span>
            )}
            {counts && counts[1] > 0 && (
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${SEVERITY_CONFIG[1].badgeVariant}`}>
                {counts[1]} leve{counts[1] > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Landmarks severos */}
          {severeItems.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-medium">Severos:</p>
              <ul className="mt-0.5 space-y-0.5">
                {severeItems.map((name) => (
                  <li key={name} className="text-xs text-red-700 capitalize">· {name}</li>
                ))}
              </ul>
            </div>
          )}

          {latest && (
            <p className="text-xs text-gray-400 mt-1">
              Última avaliação: {new Date(latest.appointment_date).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
