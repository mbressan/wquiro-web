import { Outlet } from 'react-router-dom'
import { Activity } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo — branding */}
      <div className="hidden flex-col justify-between bg-primary-600 p-12 lg:flex lg:w-2/5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">wQuiro</span>
        </div>

        <div>
          <blockquote className="text-white">
            <p className="text-2xl font-medium leading-snug">
              "A gestão completa da sua clínica de quiropraxia em um só lugar."
            </p>
            <footer className="mt-4 text-sm text-primary-200">
              Agenda · Prontuário · Financeiro · WhatsApp
            </footer>
          </blockquote>
        </div>

        <p className="text-xs text-primary-300">
          © {new Date().getFullYear()} wQuiro. Todos os direitos reservados.
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">wQuiro</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
