import { useEffect, useState } from 'react'
import { Outlet, useMatches, useNavigate } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BillingBanner } from '@/components/layout/BillingBanner'
import { setNavigate } from '@/lib/navigation'

export function DashboardLayout() {
  const matches = useMatches()
  const title = ([...matches].reverse().find(m => (m.handle as { title?: string })?.title)
    ?.handle as { title?: string } | undefined)?.title ?? 'QuiroGestão'

  const navigate = useNavigate()
  useEffect(() => { setNavigate(navigate) }, [navigate])

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <BillingBanner />
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
