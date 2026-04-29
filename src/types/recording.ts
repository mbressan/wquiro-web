export type RecordingState = 'idle' | 'requesting' | 'recording' | 'uploading' | 'done' | 'error';

export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AiCategorized {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  error?: string;
}

export interface ConsultationRecording {
  id: string;
  clinical_record: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  transcription_status: TranscriptionStatus;
  transcription: string;
  transcription_edited: string;
  ai_categorized: AiCategorized;
  created_at: string;
}

export interface TranscriptionPollResponse {
  id: string;
  transcription_status: TranscriptionStatus;
  transcription: string;
  transcription_edited: string;
  duration_seconds: number | null;
  ai_categorized: AiCategorized;
  transcription_error: string;
  created_at: string;
}

export interface ApplyTranscriptionPayload {
  use_ai_categorized: boolean;
  transcription_text?: string;
  target_field?: 'subjective' | 'objective' | 'assessment' | 'plan';
}

export interface ApplyTranscriptionResponse {
  clinical_record_id: string;
  updated_fields: string[];
}
