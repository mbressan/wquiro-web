export type ProfessionalRole = 'admin' | 'professional' | 'receptionist';

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: ProfessionalRole;
  is_active: boolean;
  specialties: string[];
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
  specialties?: string[];
  commission_percentage?: number | null;
  notes?: string;
}

export interface ProfessionalUpdate {
  name?: string;
  phone?: string;
  specialties?: string[];
  commission_percentage?: number | null;
  notes?: string;
  is_active?: boolean;
}

export interface ProfessionalFilters {
  role?: ProfessionalRole;
  is_active?: boolean;
  search?: string;
  specialties?: string;
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
