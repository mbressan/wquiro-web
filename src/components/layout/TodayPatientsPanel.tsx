import { createContext, useContext, useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppointments } from '@/hooks/useAppointments';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useAuthStore } from '@/stores/authStore';
import type { Appointment } from '@/types/appointment';

// ---------------------------------------------------------------------------
// Context — consumed by TodayPatientsPanel; Provider supplied by DashboardLayout
// ---------------------------------------------------------------------------

export const TodayPanelContext = createContext<{
  selectedAppt: Appointment | null;
  setSelectedAppt: (a: Appointment | null) => void;
}>({ selectedAppt: null, setSelectedAppt: () => {} });

// ---------------------------------------------------------------------------
// Appointment-type badge
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<string, { label: string; className: string }> = {
  avaliacao: { label: 'Avaliação', className: 'bg-purple-100 text-purple-700' },
  retorno: { label: 'Retorno', className: 'bg-blue-100 text-blue-700' },
  manutencao: { label: 'Manutenção', className: 'bg-green-100 text-green-700' },
  emergencia: { label: 'Urgência', className: 'bg-red-100 text-red-700' },
};

function TypeBadge({ type }: { type: string }) {
  const config = TYPE_LABELS[type] ?? {
    label: type,
    className: 'bg-gray-100 text-gray-600',
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium leading-tight ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface TodayPatientsPanelProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function TodayPatientsPanel({ mobileOpen = false, onCloseMobile }: TodayPatientsPanelProps) {
  const { setSelectedAppt, selectedAppt } = useContext(TodayPanelContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [profId, setProfId] = useState<string | undefined>();

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data, isLoading, isError } = useAppointments({
    date: dateStr,
    ...(profId ? { professional: profId } : {}),
  });

  const { data: professionals } = useProfessionals();

  const appointments = [...(data?.results ?? [])].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
  );

  const goToPrev = () => setSelectedDate((d) => subDays(d, 1));
  const goToNext = () => setSelectedDate((d) => addDays(d, 1));

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Panel — hidden on mobile unless mobileOpen */}
      <aside className={[
        'w-56 shrink-0 flex flex-col h-full border-r border-gray-200 bg-white',
        'hidden lg:flex', // Always hidden on mobile
        mobileOpen ? 'fixed inset-y-0 right-0 z-40 lg:relative' : '', // Mobile: slide-in overlay
      ].join(' ')}>
      {/* Header — com botão fechar em mobile */}
      <div className="px-3 pt-4 pb-3 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Pacientes do dia
          </h2>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrev}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Dia anterior"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="text-xs font-medium text-gray-700">
            {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
          </span>

          <button
            type="button"
            onClick={goToNext}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Próximo dia"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Professional filter — admin only */}
        {isAdmin && professionals && professionals.length > 0 && (
          <select
            value={profId ?? ''}
            onChange={(e) => setProfId(e.target.value || undefined)}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Todos os profissionais</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="h-px bg-gray-100 shrink-0" />

      {/* List area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="space-y-3 px-3 pt-3">
            {[0, 1, 2, 4].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-14 rounded-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3.5 w-8" />
                  <Skeleton className="h-3.5 flex-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <p className="px-3 pt-3 text-xs text-red-500">Erro ao carregar agenda</p>
        )}

        {!isLoading && !isError && appointments.length === 0 && (
          <p className="px-3 pt-4 text-xs text-gray-400 leading-relaxed">
            Nenhum paciente agendado
          </p>
        )}

        {!isLoading && !isError && appointments.length > 0 && (
          <ul className="divide-y divide-gray-50">
            {appointments.map((appt) => {
              const isSelected = selectedAppt?.id === appt.id;
              return (
                <li key={appt.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedAppt(isSelected ? null : appt)}
                    className={[
                      'w-full text-left px-3 py-2.5 transition-colors',
                      isSelected
                        ? 'bg-primary-50 border-l-2 border-primary-600'
                        : 'hover:bg-gray-50 border-l-2 border-transparent',
                    ].join(' ')}
                  >
                    {/* Type badge */}
                    <div className="mb-0.5">
                      <TypeBadge type={appt.appointment_type} />
                    </div>

                    {/* Time + name + calendar icon */}
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 font-mono text-[11px] text-gray-500">
                        {format(new Date(appt.scheduled_at), 'HH:mm')}
                      </span>
                      <span className="flex-1 text-xs text-gray-900 truncate">
                        {appt.patient_name}
                      </span>
                      <Calendar size={11} className="shrink-0 text-gray-400" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      </aside>
    </>
  );
}
