import { Download, Printer, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { differenceInYears, differenceInMonths, differenceInDays, parseISO } from 'date-fns'
import type { Patient } from '@/types/patient'
import type { Appointment } from '@/types/appointment'

function calcAge(dob: string | null): string {
  if (!dob) return 'Idade desconhecida'
  const birth = parseISO(dob)
  const now = new Date()
  const years = differenceInYears(now, birth)
  const months = differenceInMonths(now, birth) % 12
  const days = differenceInDays(now, birth) % 30
  if (years > 0) return `${years} anos`
  if (months > 0) return `${months} meses`
  return `${days} dias`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

const GENDER_MAP: Record<string, string> = {
  M: 'Masculino',
  F: 'Feminino',
  O: 'Outro',
  N: 'Não informado',
}

interface PatientSummaryCardProps {
  patient: Patient
  appointment: Appointment | null | undefined
  firstConsultationDate: string | null
}

export function PatientSummaryCard({ patient, appointment: _appointment, firstConsultationDate }: PatientSummaryCardProps) {
  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success('Link copiado!')
    })
  }

  const initials = getInitials(patient.name)

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{patient.name}</p>
          <p className="text-sm text-gray-500">
            {calcAge(patient.date_of_birth)} · {GENDER_MAP[patient.gender] ?? patient.gender} · Particular
          </p>
          <p className="text-xs text-gray-400">
            Primeira consulta: {firstConsultationDate ?? 'Sem registro'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          title="Baixar PDF"
          onClick={() => window.print()}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          title="Imprimir"
          onClick={() => window.print()}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <Printer className="h-4 w-4" />
        </button>
        <button
          title="Compartilhar"
          onClick={handleShare}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
