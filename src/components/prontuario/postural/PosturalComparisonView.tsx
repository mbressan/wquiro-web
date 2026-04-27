import { useState } from 'react'
import type { PosturalHistoricoItem, PosturalViewType, LandmarkEntry } from '@/types/posture'
import { PosturalView } from './PosturalView'

const TABS: { id: PosturalViewType; label: string }[] = [
  { id: 'anterior', label: 'Anterior' },
  { id: 'posterior', label: 'Posterior' },
  { id: 'lateral_right', label: 'Lateral D' },
  { id: 'lateral_left', label: 'Lateral E' },
]

function getLandmark(item: PosturalHistoricoItem, view: PosturalViewType, name: string): LandmarkEntry | undefined {
  return item.posture_assessment[view].landmarks.find((l) => l.name === name)
}

interface ComparisonColumnProps {
  item: PosturalHistoricoItem
  otherItem?: PosturalHistoricoItem
  activeView: PosturalViewType
  label: string
}

function ComparisonColumn({ item, otherItem, activeView, label }: ComparisonColumnProps) {
  const viewData = item.posture_assessment[activeView]
  const recordDate = new Date(item.appointment_date).toLocaleDateString('pt-BR')

  // Compute improvements: landmarks with lower severity than otherItem
  const improvedNames = new Set<string>()
  if (otherItem) {
    for (const lm of viewData.landmarks) {
      const otherLm = getLandmark(otherItem, activeView, lm.name)
      if (otherLm && lm.severity < otherLm.severity) {
        improvedNames.add(lm.name)
      }
    }
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className="text-xs text-gray-400">{recordDate}</span>
      </div>

      {improvedNames.size > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {[...improvedNames].map((name) => (
            <span
              key={name}
              className="inline-flex items-center rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700"
            >
              ↓ {name}
            </span>
          ))}
        </div>
      )}

      <PosturalView
        view={activeView}
        data={viewData}
        onChange={() => undefined}
        readOnly
      />
    </div>
  )
}

interface PosturalComparisonViewProps {
  baseline: PosturalHistoricoItem
  current?: PosturalHistoricoItem
}

export function PosturalComparisonView({ baseline, current }: PosturalComparisonViewProps) {
  const [activeView, setActiveView] = useState<PosturalViewType>('anterior')

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveView(tab.id)}
            className={[
              'flex-1 px-3 py-2 text-xs font-medium transition-colors focus:outline-none',
              activeView === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-500 hover:bg-gray-50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Columns */}
      <div className="flex gap-4">
        <ComparisonColumn
          item={baseline}
          otherItem={undefined}
          activeView={activeView}
          label="Avaliação inicial"
        />

        {current && current.clinical_record_id !== baseline.clinical_record_id && (
          <>
            <div className="w-px bg-gray-200 shrink-0" />
            <ComparisonColumn
              item={current}
              otherItem={baseline}
              activeView={activeView}
              label="Atual"
            />
          </>
        )}
      </div>
    </div>
  )
}
