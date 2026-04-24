import { Outlet, Link } from 'react-router-dom'
import { BillingBanner } from '@/components/layout/BillingBanner'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'

export function DashboardLayout() {
  const logoutMutation = useLogout()
  const user = useAuthStore((s) => s.user)
  const clinic = useAuthStore((s) => s.clinic)

  return (
    <div className="dashboard-layout">
      <BillingBanner />
      <header className="dashboard-header">
        <div className="dashboard-header__brand">
          <Link to="/">QuiroGestão</Link>
          {clinic && <span className="dashboard-header__clinic">{clinic.name}</span>}
        </div>
        <div className="dashboard-header__user">
          {user && <span>{user.name}</span>}
          <button onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            Sair
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}
