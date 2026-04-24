export interface Plan {
  id: string
  name: string
  slug: string
  price_monthly: string
  price_yearly: string
  max_professionals: number
  max_patients: number
  has_whatsapp: boolean
  has_ai: boolean
  has_multi_clinic: boolean
  features: Record<string, unknown>
}

export interface SubscriptionUsage {
  current: number
  limit: number
}

export interface Subscription {
  id: string
  status: 'trialing' | 'active' | 'past_due' | 'expired' | 'canceled'
  trial_ends_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  payment_gateway_id: string
}

export interface SubscriptionCurrent {
  plan: {
    name: string
    slug: string
    price_monthly: string
  }
  status: 'trialing' | 'active' | 'past_due' | 'expired' | 'canceled'
  trial_days_remaining: number
  current_period_end: string | null
  cancel_at_period_end: boolean
  usage: {
    professionals: SubscriptionUsage
    patients: SubscriptionUsage
  }
  banner: boolean
}
