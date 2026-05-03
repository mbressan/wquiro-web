import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { TopNav } from '@/components/layout/TopNav'
import { BillingBanner } from '@/components/layout/BillingBanner'
import { setNavigate } from '@/lib/navigation'

export function ProntuarioLayout() {
  const navigate = useNavigate()
  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <BillingBanner />
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
