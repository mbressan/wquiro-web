import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useTodayAppointments } from '@/hooks/useAppointments';
import type { Appointment } from '@/types/appointment';

interface TodayPatientsListProps {
  onSelectAppointment: (appointment: Appointment) => void;
  professionalId?: string;
}

export function TodayPatientsList({ onSelectAppointment, professionalId }: TodayPatientsListProps) {
  const { data, isLoading, isError } = useTodayAppointments(professionalId);

  const appointments = [...(data?.results ?? [])].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
  );

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-semibold text-gray-700 px-4 pt-4 pb-2 shrink-0">
        Pacientes de hoje
      </h2>

      {isLoading && (
        <div className="space-y-3 px-4 pt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="px-4 text-sm text-red-500">Erro ao carregar agenda</p>
      )}

      {!isLoading && !isError && appointments.length === 0 && (
        <p className="px-4 text-sm text-gray-400">Nenhum paciente agendado para hoje</p>
      )}

      {!isLoading && !isError && appointments.length > 0 && (
        <ul className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {appointments.map((appt) => (
            <li key={appt.id}>
              <button
                type="button"
                onClick={() => onSelectAppointment(appt)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="shrink-0 text-xs font-mono text-gray-500 w-10">
                  {format(new Date(appt.scheduled_at), 'HH:mm')}
                </span>
                <span className="flex-1 text-sm text-gray-900 truncate">{appt.patient_name}</span>
                <StatusBadge type="appointment" status={appt.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
