import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { ConsultationTimer } from '@/components/agenda/ConsultationTimer'
import type { ClinicalRecord } from '@/types/record'
import type { Appointment } from '@/types/appointment'

export type SectionKey =
  | 'form'
  | 'historico'
  | 'exames'
  | 'imagens'
  | 'prescricoes'
  | 'documentos'
  | 'acompanhamento'

interface ProntuarioSidebarProps {
  record: ClinicalRecord
  appointment: Appointment | null | undefined
  appointmentLoading?: boolean
  activeSection: SectionKey
  onSectionChange: (s: SectionKey) => void
  onInitiate?: () => void
  onFinalize?: () => void
}

const BASE_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'historico', label: 'Histórico de Consulta' },
  { key: 'acompanhamento', label: 'Tabela de acompanhamentos' },
  { key: 'prescricoes', label: 'Prescrições' },
]

const IN_PROGRESS_SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'form', label: 'Atendimentos' },
  { key: 'exames', label: 'Exames e procedimentos' },
  { key: 'documentos', label: 'Documentos e atestados' },
  { key: 'imagens', label: 'Imagens e anexos' },
]

export function ProntuarioSidebar({ record, appointment, appointmentLoading, activeSection, onSectionChange, onInitiate, onFinalize }: ProntuarioSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isInProgress = appointment?.status === 'in_progress'
  const sections = isInProgress ? [...BASE_SECTIONS, ...IN_PROGRESS_SECTIONS] : BASE_SECTIONS

  const actionButton = record.is_locked ? (
    <span className="flex items-center gap-2 text-sm text-gray-500 font-medium px-4 py-2 bg-gray-100 rounded-lg">
      🔒 Prontuário finalizado
    </span>
  ) : isInProgress ? (
    <button
      className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
      onClick={onFinalize}
    >
      Finalizar atendimento
    </button>
  ) : (
    <button
      className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors disabled:opacity-60"
      onClick={onInitiate}
      disabled={appointmentLoading}
    >
      {appointmentLoading ? 'Carregando...' : 'Iniciar atendimento'}
    </button>
  )

  const navItems = (
    <nav className="flex flex-col gap-1">
      {sections.map(s => (
        <button
          key={s.key}
          onClick={() => { onSectionChange(s.key); setMobileOpen(false) }}
          className={`text-left text-sm px-3 py-2 rounded-md transition-colors ${
            activeSection === s.key
              ? 'text-primary-600 bg-primary-50 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {s.label}
        </button>
      ))}
    </nav>
  )

  const sidebarContent = (
    <>
      {actionButton}
      <ConsultationTimer startedAt={isInProgress ? appointment?.started_at : null} fallback="00:00:00" />
      <hr className="border-gray-100" />
      {navItems}
    </>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-20 left-2 z-20 p-1.5 bg-white border border-gray-200 rounded-md shadow"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-52 bg-white z-40 flex flex-col p-4 gap-4 shadow-xl lg:hidden overflow-y-auto">
            <button className="self-end" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-52 shrink-0 flex-col border-r border-gray-200 bg-white h-full overflow-y-auto p-4 gap-4">
        {sidebarContent}
      </aside>
    </>
  )
}
