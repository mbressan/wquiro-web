import type { AppointmentStatus } from '@/types/appointment';

const labels: Record<AppointmentStatus, string> = {
  pending_payment: 'Aguardando Pagamento',
  scheduled: 'Agendado',
  in_progress: 'Em Atendimento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não Compareceu',
};

const colors: Record<AppointmentStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
  no_show: 'bg-red-100 text-red-800',
};

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}
