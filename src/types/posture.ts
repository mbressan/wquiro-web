export type PosturalViewType = 'anterior' | 'posterior' | 'lateral_right' | 'lateral_left';

export type DeviationType =
  | 'desnível'
  | 'rotação'
  | 'inclinação'
  | 'anteriorização'
  | 'posteriorização'
  | 'outro';

export type DirectionType =
  | 'right_low'
  | 'left_low'
  | 'right'
  | 'left'
  | 'anterior'
  | 'posterior'
  | 'bilateral';

export type SeverityLevel = 1 | 2 | 3;

export interface LandmarkEntry {
  name: string;
  deviation: DeviationType;
  direction: DirectionType;
  severity: SeverityLevel;
}

export interface PosturalViewData {
  landmarks: LandmarkEntry[];
  overall_notes: string;
}

export interface PosturalAssessment {
  anterior: PosturalViewData;
  posterior: PosturalViewData;
  lateral_right: PosturalViewData;
  lateral_left: PosturalViewData;
}

export interface PosturalHistoricoItem {
  clinical_record_id: string;
  appointment_date: string;
  record_type: 'anamnesis' | 'reevaluation';
  posture_assessment: PosturalAssessment;
}
