import { Activity, Bell, ChevronDown, LogOut, Menu, User, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/hooks/useAuth'

type NavChild = { label: string; to: string }

type NavItemDef =
  | { label: string; to: string; end?: boolean; alias?: string[]; children?: never }
  | { label: string; children: NavChild[]; to?: never; end?: never; alias?: never }

const NAV_ITEMS: NavItemDef[] = [
  { label: 'Painel', to: '/', end: true },
  { label: 'Agenda', to: '/agenda' },
  { label: 'Prontuários', to: '/pacientes', alias: ['/prontuario', '/pacientes'] },
  {
    label: 'Gestão',
    children: [
      { label: 'Profissionais', to: '/profissionais' },
      { label: 'Configurações', to: '/configuracoes' },
    ],
  },
  {
    label: 'Financeiro',
    children: [
      { label: 'Caixa', to: '/financeiro/caixa' },
      { label: 'Dashboard', to: '/financeiro/dashboard' },
    ],
  },
]

function UserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const user = useAuthStore((s) => s.user)
  const logoutMutation = useLogout()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
          {initials}
        </div>
        <span className="max-w-32 truncate font-medium">{user?.name ?? 'Usuário'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2.5">
            <p className="text-xs font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="py-1">
            <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <User className="h-4 w-4 text-gray-400" />
              Meu perfil
            </button>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface DropdownMenuProps {
  label: string
  children: NavChild[]
}

function DropdownMenu({ label, children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const isChildActive = children.some((c) => pathname.startsWith(c.to))

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex items-center gap-1 border-b-2 px-1 pb-0.5 pt-px text-sm font-medium transition-colors',
          isChildActive
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-600 hover:text-gray-900',
        ].join(' ')}
      >
        {label}
        <ChevronDown
          className={['h-3.5 w-3.5 transition-transform', open ? 'rotate-180' : ''].join(' ')}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  'block px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'font-medium text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:bg-gray-50',
                ].join(' ')
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-200 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">wQuiro</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label}>
                    <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {item.label}
                    </p>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          [
                            'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          ].join(' ')
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )
              }

              const isAliasActive =
                item.alias?.some((a) => pathname.startsWith(a)) ?? false

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive || isAliasActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">wQuiro</span>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              if (item.children) {
                return (
                  <DropdownMenu key={item.label} label={item.label} children={item.children} />
                )
              }

              const isAliasActive =
                item.alias?.some((a) => pathname.startsWith(a)) ?? false

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'border-b-2 px-1 pb-0.5 pt-px text-sm font-medium transition-colors',
                      isActive || isAliasActive
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100">
            <Bell className="h-4.5 w-4.5" size={18} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
          <div className="mx-1 h-5 w-px bg-gray-200" />
          <div className="hidden lg:block">
            <UserMenu />
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
