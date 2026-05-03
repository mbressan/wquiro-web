import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { TopNav } from '@/components/layout/TopNav'
import { TodayPatientsPanel, TodayPanelContext } from '@/components/layout/TodayPatientsPanel'
import { BillingBanner } from '@/components/layout/BillingBanner'
import { setNavigate } from '@/lib/navigation'
import type { Appointment } from '@/types/appointment'

// Re-export TodayPanelContext so consumers can import from this layout module
export { TodayPanelContext } from '@/components/layout/TodayPatientsPanel'

export function DashboardLayout() {
  const navigate = useNavigate()
  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [todayPanelMobileOpen, setTodayPanelMobileOpen] = useState(false)

  return (
    <TodayPanelContext.Provider value={{ selectedAppt, setSelectedAppt }}>
      <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
        <BillingBanner />
        <TopNav />
        <div className="flex flex-1 overflow-hidden relative">
          <TodayPatientsPanel
            mobileOpen={todayPanelMobileOpen}
            onCloseMobile={() => setTodayPanelMobileOpen(false)}
          />
          <main className="flex-1 overflow-y-auto relative">
            {/* Mobile floating button to open today's patients panel */}
            <button
              onClick={() => setTodayPanelMobileOpen(true)}
              className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors lg:hidden"
              aria-label="Abrir painel de pacientes do dia"
              title="Pacientes do dia"
            >
              <Calendar className="h-5 w-5" />
            </button>
            <Outlet />
          </main>
        </div>
      </div>
    </TodayPanelContext.Provider>
  )
}
