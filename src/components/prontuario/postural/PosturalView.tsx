import anteriorSvg from '@/assets/posture/anterior.svg?url'
import posteriorSvg from '@/assets/posture/posterior.svg?url'
import lateralSvg from '@/assets/posture/lateral.svg?url'
import type { PosturalViewType, PosturalViewData, LandmarkEntry } from '@/types/posture'
import { LANDMARKS_BY_VIEW, DIRECTIONS_BY_VIEW } from '@/lib/posture-constants'
import { LandmarkRow } from './LandmarkRow'

const SVG_BY_VIEW: Record<PosturalViewType, string> = {
  anterior: anteriorSvg,
  posterior: posteriorSvg,
  lateral_right: lateralSvg,
  lateral_left: lateralSvg,
}

const VIEW_LABELS: Record<PosturalViewType, string> = {
  anterior: 'Vista Anterior',
  posterior: 'Vista Posterior',
  lateral_right: 'Vista Lateral Direita',
  lateral_left: 'Vista Lateral Esquerda',
}

interface PosturalViewProps {
  view: PosturalViewType
  data: PosturalViewData
  onChange: (data: PosturalViewData) => void
  readOnly?: boolean
}

export function PosturalView({ view, data, onChange, readOnly = false }: PosturalViewProps) {
  const landmarks = LANDMARKS_BY_VIEW[view]
  const availableDirections = DIRECTIONS_BY_VIEW[view]
  const svgSrc = SVG_BY_VIEW[view]
  const isLateralLeft = view === 'lateral_left'

  function getLandmarkEntry(name: string): LandmarkEntry | null {
    return data.landmarks.find((l) => l.name === name) ?? null
  }

  function handleLandmarkChange(name: string, entry: LandmarkEntry | null) {
    let updated: LandmarkEntry[]
    if (entry === null) {
      updated = data.landmarks.filter((l) => l.name !== name)
    } else {
      const exists = data.landmarks.some((l) => l.name === name)
      if (exists) {
        updated = data.landmarks.map((l) => (l.name === name ? entry : l))
      } else {
        updated = [...data.landmarks, entry]
      }
    }
    onChange({ ...data, landmarks: updated })
  }

  function handleNotesChange(notes: string) {
    onChange({ ...data, overall_notes: notes })
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Silhueta */}
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500 mb-2">{VIEW_LABELS[view]}</span>
        <img
          src={svgSrc}
          alt={`Silhueta ${VIEW_LABELS[view]}`}
          className="h-48 mx-auto"
          style={isLateralLeft ? { transform: 'scaleX(-1)' } : undefined}
        />
      </div>

      {/* Landmarks e notas */}
      <div className="flex flex-col gap-2">
        <div className="space-y-0">
          {landmarks.map((name) => (
            <LandmarkRow
              key={name}
              landmark={getLandmarkEntry(name)}
              landmarkName={name}
              availableDirections={availableDirections}
              onChange={(entry) => handleLandmarkChange(name, entry)}
              readOnly={readOnly}
            />
          ))}
        </div>

        <div className="mt-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Observações gerais</label>
          {readOnly ? (
            <p className="text-xs text-gray-700 whitespace-pre-wrap min-h-[40px]">
              {data.overall_notes || <span className="text-gray-400">—</span>}
            </p>
          ) : (
            <textarea
              value={data.overall_notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={3}
              placeholder="Observações adicionais sobre esta vista..."
              className="mt-0.5 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>
      </div>
    </div>
  )
}
