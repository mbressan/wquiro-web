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

export interface LoginResponse {
  access: string
  refresh: string
  user: User
  clinic: Clinic
}

export interface MeResponse {
  user: User
  clinic: Clinic | null
  subscription: {
    status: string
    trial_days_remaining: number
  } | null
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
