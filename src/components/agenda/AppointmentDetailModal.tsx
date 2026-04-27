import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Pencil, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { StatusBadge } from './StatusBadge';
import { useCheckin } from '@/hooks/useAppointments';
import type { Appointment } from '@/types/appointment';

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  evaluation: 'Avaliação',
  follow_up: 'Retorno',
  maintenance: 'Manutenção',
};

interface AppointmentDetailModalProps {
  appointment: Appointment;
  onClose: () => void;
  onEdit: () => void;
}

export function AppointmentDetailModal({ appointment, onClose, onEdit }: AppointmentDetailModalProps) {
  const navigate = useNavigate();
  const checkin = useCheckin(appointment.id);
  const start = new Date(appointment.scheduled_at);
  const end = new Date(appointment.end_at);
  const dateLabel = format(start, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const timeLabel = `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`;

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') onClose();
  }

  function handleCheckin() {
    checkin.mutate(undefined, {
      onSuccess: (data) => {
        onClose();
        navigate(`/prontuario/${data.clinical_record_id}`, {
          state: { from: 'agenda' },
        });
      },
      onError: () => toast.error('Erro ao iniciar atendimento.'),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Detalhes da Consulta</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Booking fee alert */}
        {appointment.booking_fee_required && !appointment.booking_fee_paid && (
          <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            Taxa de agendamento pendente — R$ {appointment.booking_fee_amount}
          </div>
        )}

        {/* Fields */}
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Paciente</dt>
            <dd className="text-gray-900">{appointment.patient_name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Profissional</dt>
            <dd className="text-gray-900">{appointment.professional_name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Data</dt>
            <dd className="text-gray-900 capitalize">{dateLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Horário</dt>
            <dd className="text-gray-900">{timeLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Tipo</dt>
            <dd className="text-gray-900">
              {APPOINTMENT_TYPE_LABELS[appointment.appointment_type] ?? appointment.appointment_type}
            </dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="font-medium text-gray-500">Status</dt>
            <dd>
              <StatusBadge status={appointment.status} />
            </dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Fechar
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
          {appointment.status === 'scheduled' && (
            <button
              onClick={handleCheckin}
              disabled={checkin.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-60"
            >
              <Play className="h-4 w-4" />
              {checkin.isPending ? 'Iniciando...' : 'Iniciar Atendimento'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
