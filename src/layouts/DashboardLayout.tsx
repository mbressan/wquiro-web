import { Outlet, useMatches } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BillingBanner } from '@/components/layout/BillingBanner'

const routeTitleMatchers: Array<{ match: (path: string) => boolean; title: string }> = [
  { match: (path) => path === '/', title: 'Dashboard' },
  { match: (path) => path === '/agenda', title: 'Agenda' },
  { match: (path) => path === '/pacientes', title: 'Pacientes' },
  { match: (path) => /^\/pacientes\/[^/]+$/.test(path), title: 'Paciente' },
  {
    match: (path) => /^\/pacientes\/[^/]+\/consultas$/.test(path),
    title: 'Consultas do Paciente',
  },
  {
    match: (path) => /^\/pacientes\/[^/]+\/prontuario$/.test(path),
    title: 'Prontuário do Paciente',
  },
  {
    match: (path) => /^\/pacientes\/[^/]+\/postural$/.test(path),
    title: 'Histórico Postural',
  },
  { match: (path) => /^\/prontuario\/[^/]+$/.test(path), title: 'Prontuário' },
  { match: (path) => path === '/financeiro/caixa', title: 'Caixa' },
  { match: (path) => path === '/financeiro/dashboard', title: 'Financeiro' },
  { match: (path) => path === '/profissionais', title: 'Profissionais' },
  { match: (path) => path === '/configuracoes', title: 'Configurações' },
]

export function DashboardLayout() {
  const matches = useMatches()
  const currentPath = matches[matches.length - 1]?.pathname ?? '/'
  const title = routeTitleMatchers.find((route) => route.match(currentPath))?.title ?? 'QuiroGestão'

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
