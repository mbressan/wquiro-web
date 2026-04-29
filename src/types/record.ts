import type { PosturalAssessment } from './posture';
import type { SpineMapData } from './spineMap';

export type RecordType = 'anamnesis' | 'follow_up' | 'reevaluation' | 'discharge';

export type SpineMap = SpineMapData;

export interface LegCheck {
  prone_short_leg: 'left' | 'right' | 'equal';
  standing_short_leg: 'left' | 'right' | 'equal';
  differential_mm: number;
}

export interface Derifield {
  result: 'positive_left' | 'positive_right' | 'negative';
  affected_vertebra: string;
  notes: string;
}

export interface AnamnesisClinicalData {
  chief_complaint?: string;
  hma?: string;
  past_history?: string;
  postural_habits?: string;
  occupation?: string;
  physical_activity?: string;
  medications?: string[];
  previous_treatments?: string;
  family_history?: string;
  pain_scale?: number;
  pain_locations?: string[];
  onset?: 'gradual' | 'sudden';
  onset_date?: string;
  aggravating_factors?: string[];
  relieving_factors?: string[];
  spine_map?: SpineMap;
  leg_check?: LegCheck;
  derifield?: Derifield;
  posture_assessment?: PosturalAssessment;
}

export interface FollowUpClinicalData {
  pain_scale?: number;
  pain_locations?: string[];
  patient_feedback?: string;
  techniques_used?: string[];
  spine_map?: SpineMap;
  leg_check?: LegCheck;
  derifield?: Derifield;
}

export type ClinicalData = AnamnesisClinicalData | FollowUpClinicalData;

export interface ClinicalRecord {
  id: string;
  appointment: string;
  patient: string;
  professional: string;
  record_type: RecordType;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  clinical_data: ClinicalData;
  exam_files: ExamFile[];
  created_at: string;
  updated_at: string;
}

export interface ClinicalRecordListItem {
  id: string;
  date: string;
  record_type: RecordType;
  pain_scale: number | null;
  professional_name: string;
  soap_summary: string;
  spine_adjusted: string[];
}

export interface ExamFile {
  id: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  description: string;
  presigned_url: string;
  created_at: string;
}

export interface SpineHistoryItem {
  date: string;
  appointment_id: string;
  adjusted: string[];
}

export interface ClinicalRecordUpdate {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  clinical_data?: ClinicalData;
}
