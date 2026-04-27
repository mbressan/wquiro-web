import type { LandmarkEntry, DeviationType, DirectionType, SeverityLevel } from '@/types/posture'
import {
  SEVERITY_CONFIG,
  DEVIATION_LABELS,
  DIRECTION_LABELS,
} from '@/lib/posture-constants'

interface LandmarkRowProps {
  landmark: LandmarkEntry | null
  landmarkName: string
  availableDirections: DirectionType[]
  onChange: (entry: LandmarkEntry | null) => void
  readOnly?: boolean
}

const DEVIATIONS: DeviationType[] = [
  'desnível',
  'rotação',
  'inclinação',
  'anteriorização',
  'posteriorização',
  'outro',
]

const SEVERITIES: SeverityLevel[] = [1, 2, 3]

export function LandmarkRow({
  landmark,
  landmarkName,
  availableDirections,
  onChange,
  readOnly = false,
}: LandmarkRowProps) {
  const hasDeviation = landmark !== null

  function handleNoDeviationChange(checked: boolean) {
    if (checked) {
      onChange(null)
    } else {
      onChange({
        name: landmarkName,
        deviation: 'desnível',
        direction: availableDirections[0],
        severity: 1,
      })
    }
  }

  function handleDeviationChange(value: string) {
    if (!landmark) return
    onChange({ ...landmark, deviation: value as DeviationType })
  }

  function handleDirectionChange(value: string) {
    if (!landmark) return
    onChange({ ...landmark, direction: value as DirectionType })
  }

  function handleSeverityChange(value: string) {
    if (!landmark) return
    onChange({ ...landmark, severity: Number(value) as SeverityLevel })
  }

  if (readOnly) {
    return (
      <div className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
        <span className="w-24 text-xs font-medium text-gray-700 capitalize shrink-0">{landmarkName}</span>
        {landmark === null ? (
          <span className="text-xs text-gray-400">Sem desvio</span>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-700">{DEVIATION_LABELS[landmark.deviation]}</span>
            <span className="text-xs text-gray-500">·</span>
            <span className="text-xs text-gray-700">{DIRECTION_LABELS[landmark.direction]}</span>
            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${SEVERITY_CONFIG[landmark.severity].badgeVariant}`}>
              {SEVERITY_CONFIG[landmark.severity].label}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <span className="w-20 text-xs font-medium text-gray-700 capitalize shrink-0">{landmarkName}</span>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={!hasDeviation}
            onChange={(e) => handleNoDeviationChange(e.target.checked)}
            className="rounded border-gray-300"
          />
          Sem desvio
        </label>
        {hasDeviation && landmark && (
          <span className={`ml-auto inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${SEVERITY_CONFIG[landmark.severity].badgeVariant}`}>
            {SEVERITY_CONFIG[landmark.severity].label}
          </span>
        )}
      </div>

      {hasDeviation && landmark && (
        <div className="flex gap-2 pl-22 flex-wrap">
          <select
            value={landmark.deviation}
            onChange={(e) => handleDeviationChange(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {DEVIATIONS.map((d) => (
              <option key={d} value={d}>{DEVIATION_LABELS[d]}</option>
            ))}
          </select>

          <select
            value={landmark.direction}
            onChange={(e) => handleDirectionChange(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {availableDirections.map((dir) => (
              <option key={dir} value={dir}>{DIRECTION_LABELS[dir]}</option>
            ))}
          </select>

          <select
            value={landmark.severity}
            onChange={(e) => handleSeverityChange(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{SEVERITY_CONFIG[s].label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
