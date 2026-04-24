export type PatientGender = 'M' | 'F' | 'O' | 'N';
export type PatientStatus = 'active' | 'inactive';
export type TimelineEventType = 'appointment' | 'payment' | 'exam_upload' | 'whatsapp';

export interface PatientTag {
  id: string;
  name: string;
  color: string;
}

export interface PatientTagWithCount extends PatientTag {
  patient_count: number;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf: string;
  date_of_birth: string | null;
  gender: PatientGender;
  status: PatientStatus;
  tags: PatientTag[];
  is_new_patient: boolean;
  created_at: string;
}

export interface TimelineEvent {
  event_type: TimelineEventType;
  date: string;
  description: string;
  data: Record<string, unknown>;
}

export interface PatientDetail extends Patient {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  profession: string;
  referred_by: string;
  notes: string;
  timeline: TimelineEvent[];
}

export interface PatientCreate {
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  date_of_birth?: string;
  gender?: PatientGender;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  profession?: string;
  referred_by?: string;
  notes?: string;
  status?: PatientStatus;
  tags?: string[];
}

export interface PatientFilters {
  search?: string;
  tags?: string;
  status?: PatientStatus;
  professional?: string;
  last_appointment_before?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedPatients {
  count: number;
  next: string | null;
  previous: string | null;
  results: Patient[];
}

export interface PatientExport extends PatientDetail {
  photo: string | null;
}
