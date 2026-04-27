import { useState } from 'react'
import type { PosturalAssessment, PosturalViewType } from '@/types/posture'
import { PosturalView } from './PosturalView'

interface PosturalAssessmentFormProps {
  value: PosturalAssessment
  onChange: (value: PosturalAssessment) => void
  readOnly?: boolean
}

type TabConfig = { id: PosturalViewType; label: string }

const TABS: TabConfig[] = [
  { id: 'anterior', label: 'Anterior' },
  { id: 'posterior', label: 'Posterior' },
  { id: 'lateral_right', label: 'Lateral D' },
  { id: 'lateral_left', label: 'Lateral E' },
]

export function PosturalAssessmentForm({ value, onChange, readOnly = false }: PosturalAssessmentFormProps) {
  const [activeTab, setActiveTab] = useState<PosturalViewType>('anterior')

  function handleViewChange(view: PosturalViewType, viewData: typeof value[typeof view]) {
    onChange({ ...value, [view]: viewData })
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Tab header */}
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-1 px-3 py-2.5 text-xs font-medium transition-colors focus:outline-none',
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        <PosturalView
          view={activeTab}
          data={value[activeTab]}
          onChange={(viewData) => handleViewChange(activeTab, viewData)}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}
