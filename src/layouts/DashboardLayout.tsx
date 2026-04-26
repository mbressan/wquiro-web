import { Outlet, useMatches } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BillingBanner } from '@/components/layout/BillingBanner'

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/agenda': 'Agenda',
  '/pacientes': 'Pacientes',
  '/financeiro/caixa': 'Caixa',
  '/financeiro/dashboard': 'Financeiro',
  '/configuracoes': 'Configurações',
}

export function DashboardLayout() {
  const matches = useMatches()
  const currentPath = matches[matches.length - 1]?.pathname ?? '/'
  const title = routeTitles[currentPath] ?? ''

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <BillingBanner />
        <Header title={title} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
