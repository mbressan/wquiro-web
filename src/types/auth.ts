export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'professional' | 'receptionist'
  phone?: string
}

export interface Clinic {
  id: string
  name: string
  slug: string
  email?: string
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
