import type { PosturalViewType, DirectionType, SeverityLevel, PosturalAssessment, PosturalViewData } from '@/types/posture'

export const LANDMARKS_BY_VIEW: Record<PosturalViewType, string[]> = {
  anterior: ['cabeça', 'ombros', 'pelve', 'joelhos', 'pés'],
  posterior: ['cabeça', 'ombros', 'pelve', 'joelhos', 'pés'],
  lateral_right: ['orelha', 'ombro', 'quadril', 'joelho', 'tornozelo'],
  lateral_left: ['orelha', 'ombro', 'quadril', 'joelho', 'tornozelo'],
}

export const DIRECTIONS_BY_VIEW: Record<PosturalViewType, DirectionType[]> = {
  anterior: ['right_low', 'left_low', 'right', 'left', 'bilateral'],
  posterior: ['right_low', 'left_low', 'right', 'left', 'bilateral'],
  lateral_right: ['anterior', 'posterior'],
  lateral_left: ['anterior', 'posterior'],
}

export const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; badgeVariant: string }> = {
  1: { label: 'Leve', badgeVariant: 'bg-green-100 text-green-800' },
  2: { label: 'Moderado', badgeVariant: 'bg-yellow-100 text-yellow-800' },
  3: { label: 'Severo', badgeVariant: 'bg-red-100 text-red-800' },
}

export const DEVIATION_LABELS: Record<string, string> = {
  'desnível': 'Desnível',
  'rotação': 'Rotação',
  'inclinação': 'Inclinação',
  'anteriorização': 'Anteriorização',
  'posteriorização': 'Posteriorização',
  'outro': 'Outro',
}

export const DIRECTION_LABELS: Record<string, string> = {
  'right_low': 'Direito baixo',
  'left_low': 'Esquerdo baixo',
  'right': 'Direito',
  'left': 'Esquerdo',
  'anterior': 'Anterior',
  'posterior': 'Posterior',
  'bilateral': 'Bilateral',
}

export function emptyPosturalViewData(): PosturalViewData {
  return { landmarks: [], overall_notes: '' }
}

export function emptyPosturalAssessment(): PosturalAssessment {
  return {
    anterior: emptyPosturalViewData(),
    posterior: emptyPosturalViewData(),
    lateral_right: emptyPosturalViewData(),
    lateral_left: emptyPosturalViewData(),
  }
}
