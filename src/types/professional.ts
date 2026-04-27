export type ProfessionalRole = 'admin' | 'professional' | 'receptionist';

export interface SpecialtyRef {
  id: string;
  name: string;
  is_predefined: boolean;
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_predefined: boolean;
  professionals_count: number;
  created_at: string;
}

export interface SpecialtyCreate {
  name: string;
  description?: string;
}

export interface SpecialtyUpdate {
  name?: string;
  description?: string;
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: ProfessionalRole;
  is_active: boolean;
  specialties: SpecialtyRef[];
  commission_percentage: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalCreate {
  name: string;
  email: string;
  role: ProfessionalRole;
  phone?: string;
  commission_percentage?: number | null;
  notes?: string;
}

export interface ProfessionalUpdate {
  name?: string;
  phone?: string;
  commission_percentage?: number | null;
  notes?: string;
  is_active?: boolean;
}

export interface ProfessionalFilters {
  role?: ProfessionalRole;
  is_active?: boolean;
  search?: string;
  specialty?: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: ProfessionalRole;
  expires_at: string;
  accepted_at: string | null;
  cancelled_at: string | null;
  is_pending: boolean;
  created_at: string;
}

export interface InviteCreate {
  email: string;
  role: ProfessionalRole;
}
