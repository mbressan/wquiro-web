import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCog,
  DollarSign,
  Settings,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/',
    end: true,
  },
  {
    label: 'Agenda',
    icon: CalendarDays,
    to: '/agenda',
  },
  {
    label: 'Pacientes',
    icon: Users,
    to: '/pacientes',
  },
  {
    label: 'Profissionais',
    icon: UserCog,
    to: '/profissionais',
  },
  {
    label: 'Financeiro',
    icon: DollarSign,
    to: null,
    children: [
      { label: 'Caixa', to: '/financeiro/caixa' },
      { label: 'Dashboard', to: '/financeiro/dashboard' },
    ],
  },
]

const bottomItems = [
  { label: 'Configurações', icon: Settings, to: '/configuracoes' },
]

interface NavItemProps {
  icon: React.ElementType
  label: string
  to: string
  end?: boolean
}

function NavItem({ icon: Icon, label, to, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={['h-4.5 w-4.5 shrink-0', isActive ? 'text-primary-600' : 'text-gray-400'].join(' ')}
            size={18}
          />
          <span>{label}</span>
          {isActive && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600" />
          )}
        </>
      )}
    </NavLink>
  )
}

interface NavGroupProps {
  icon: React.ElementType
  label: string
  children: { label: string; to: string }[]
}

function NavGroup({ icon: Icon, label, children }: NavGroupProps) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const isChildActive = children.some((c) => pathname.startsWith(c.to))

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isChildActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        ].join(' ')}
      >
        <Icon className="h-4.5 w-4.5 shrink-0 text-gray-400" size={18} />
        <span>{label}</span>
        <ChevronRight
          className={['ml-auto h-3.5 w-3.5 text-gray-400 transition-transform', open || isChildActive ? 'rotate-90' : ''].join(' ')}
          size={14}
        />
      </button>
      {(open || isChildActive) && (
        <div className="ml-7 mt-0.5 space-y-0.5 border-l border-gray-100 pl-3">
          {children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) =>
                [
                  'block rounded-md px-2 py-2 text-sm transition-colors',
                  isActive
                    ? 'font-medium text-primary-600'
                    : 'text-gray-500 hover:text-gray-900',
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

interface SidebarProps {
  sidebarOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ sidebarOpen = false, onClose }: SidebarProps) {
  const clinic = useAuthStore((s) => s.clinic)

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={[
        'flex h-full w-60 shrink-0 flex-col border-r border-gray-200 bg-white',
        'fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>
        {/* Logo */}
        <div className="flex h-15 items-center gap-2.5 border-b border-gray-100 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">wQuiro</p>
            {clinic && (
              <p className="truncate text-xs text-gray-400">{clinic.name}</p>
            )}
          </div>
        </div>

        {/* Nav principal */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {navItems.map((item) =>
              item.children ? (
                <NavGroup
                  key={item.label}
                  icon={item.icon!}
                  label={item.label}
                  children={item.children}
                />
              ) : (
                <NavItem
                  key={item.to!}
                  icon={item.icon}
                  label={item.label}
                  to={item.to!}
                  end={item.end}
                />
              ),
            )}
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4 space-y-0.5">
            {bottomItems.map((item) => (
              <NavItem key={item.to} icon={item.icon} label={item.label} to={item.to} />
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}
