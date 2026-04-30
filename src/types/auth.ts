export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'professional' | 'receptionist'
  phone?: string
  color?: string
  notes?: string
  commission_percentage?: string | null
  is_active?: boolean
  specialties?: { id: string; name: string; is_predefined: boolean }[]
  created_at?: string
}

export interface Clinic {
  id: string
  name: string
  slug: string
  email?: string
  phone?: string
  address?: string
  booking_fee_enabled?: boolean
  booking_fee_amount?: string
  booking_fee_deadline_hours?: number
}

export interface AuthSubscription {
  status: string
  trial_days_remaining: number
  plan: {
    name: string
    slug: string
    has_ai: boolean
    has_whatsapp: boolean
    max_professionals: number
    max_patients: number
  }
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
  clinic: Clinic
  subscription: AuthSubscription | null
}

export interface MeResponse {
  user: User
  clinic: Clinic | null
  subscription: AuthSubscription | null
}

export interface RegisterResponse {
  access: string
  refresh: string
  user: User
  clinic: Clinic
  subscription: {
    status: string
    trial_days_remaining: number
    plan: string
  }
}
