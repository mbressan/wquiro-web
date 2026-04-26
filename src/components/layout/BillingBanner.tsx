import { Link } from 'react-router-dom'
import { AlertTriangle, XCircle } from 'lucide-react'
import { useSubscriptionCurrent } from '@/hooks/useSubscription'

export function BillingBanner() {
  const { data: subscription } = useSubscriptionCurrent()

  if (!subscription) return null
  if (subscription.status === 'active') return null

  if (subscription.status === 'trialing' && subscription.banner) {
    const days = subscription.trial_days_remaining
    return (
      <div className="flex items-center justify-between bg-amber-50 px-6 py-2 text-sm border-b border-amber-100">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Trial: <strong>{days} dia{days !== 1 ? 's' : ''}</strong> restante{days !== 1 ? 's' : ''}
          </span>
        </div>
        <Link
          to="/billing"
          className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700"
        >
          Assinar plano
        </Link>
      </div>
    )
  }

  if (subscription.status === 'expired') {
    return (
      <div className="flex items-center justify-between bg-red-50 px-6 py-2 text-sm border-b border-red-100">
        <div className="flex items-center gap-2 text-red-800">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>Trial expirado — acesso somente leitura</span>
        </div>
        <Link
          to="/billing"
          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
        >
          Ver planos
        </Link>
      </div>
    )
  }

  return null
}
