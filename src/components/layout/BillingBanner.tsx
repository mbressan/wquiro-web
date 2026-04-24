import { Link } from 'react-router-dom'
import { useSubscriptionCurrent } from '@/hooks/useSubscription'

export function BillingBanner() {
  const { data: subscription } = useSubscriptionCurrent()

  if (!subscription) return null

  if (subscription.status === 'active') return null

  if (subscription.status === 'trialing' && subscription.banner) {
    return (
      <div className="billing-banner billing-banner--warning" role="alert">
        <span>
          Trial: {subscription.trial_days_remaining} dia
          {subscription.trial_days_remaining !== 1 ? 's' : ''} restante
          {subscription.trial_days_remaining !== 1 ? 's' : ''}
        </span>
        <Link to="/billing" className="billing-banner__cta">
          Assinar plano
        </Link>
      </div>
    )
  }

  if (subscription.status === 'expired') {
    return (
      <div className="billing-banner billing-banner--danger" role="alert">
        <span>Trial expirado — somente leitura</span>
        <Link to="/billing" className="billing-banner__cta">
          Ver planos
        </Link>
      </div>
    )
  }

  return null
}
