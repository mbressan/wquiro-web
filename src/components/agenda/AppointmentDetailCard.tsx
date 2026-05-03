import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { StatusBadge, AppointmentTypeBadge, Button } from '@/components/ui';
import type { AppointmentStatus } from '@/components/ui';
import { useCheckin } from '@/hooks/useAppointments';
import type { Appointment } from '@/types/appointment';

interface AppointmentDetailCardProps {
  appointment: Appointment;
  onClose: () => void;
}

export function AppointmentDetailCard({ appointment, onClose }: AppointmentDetailCardProps) {
  const navigate = useNavigate();
  const checkin = useCheckin(appointment.id);

  const start = new Date(appointment.scheduled_at);
  const end = new Date(appointment.end_at);
  const dateLabel = format(start, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const timeLabel = `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`;

  function handleCheckin() {
    checkin.mutate(undefined, {
      onSuccess: (data) => {
        onClose();
        navigate(`/prontuario/${data.clinical_record_id}`, { state: { from: 'dashboard' } });
      },
      onError: () => toast.error('Erro ao iniciar atendimento.'),
    });
  }

  function handleOpenRecord() {
    if (appointment.clinical_record_id) {
      onClose();
      navigate(`/prontuario/${appointment.clinical_record_id}`, { state: { from: 'dashboard' } });
    }
  }

  const isInProgress = appointment.status === 'in_progress';
  const isCompleted = appointment.status === 'completed';
  const canOpenRecord = (isInProgress || isCompleted) && appointment.clinical_record_id;

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm p-6 max-w-sm">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Fechar"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mb-4">
        <StatusBadge type="appointment" status={appointment.status as AppointmentStatus} />
      </div>

      <dl className="space-y-3 text-sm mb-6">
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
        <div className="flex justify-between items-center">
          <dt className="font-medium text-gray-500">Tipo</dt>
          <dd>
            <AppointmentTypeBadge appointmentType={appointment.appointment_type} />
          </dd>
        </div>
        {appointment.called_at && (
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Chamado em</dt>
            <dd className="text-gray-900">
              {format(new Date(appointment.called_at), 'HH:mm')}
            </dd>
          </div>
        )}
      </dl>

      {canOpenRecord ? (
        <Button
          onClick={handleOpenRecord}
          variant="ghost"
          className="w-full mt-4"
        >
          <FileText className="h-4 w-4" />
          {isInProgress ? 'Abrir Prontuário' : 'Ver Prontuário'}
        </Button>
      ) : !isCompleted && (
        <Button
          onClick={handleCheckin}
          loading={checkin.isPending}
          className="bg-primary-600 text-white w-full mt-4"
        >
          <Play className="h-4 w-4" />
          {checkin.isPending ? 'Iniciando...' : isInProgress ? 'Abrir Prontuário' : 'Atender'}
        </Button>
      )}
    </div>
  );
}
