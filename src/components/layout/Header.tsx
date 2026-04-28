import { Bell, ChevronDown, LogOut, Menu, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useLogout } from '@/hooks/useAuth'

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

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-15 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="mr-3 rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100">
          <Bell className="h-4.5 w-4.5" size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <UserMenu />
      </div>
    </header>
  )
}
