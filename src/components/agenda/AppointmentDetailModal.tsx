import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, FileText, Pencil, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Modal, StatusBadge, AppointmentTypeBadge, Button } from '@/components/ui';
import type { AppointmentStatus } from '@/components/ui';
import { useCallPatient, useCheckin } from '@/hooks/useAppointments';
import type { Appointment } from '@/types/appointment';

interface AppointmentDetailModalProps {
  appointment: Appointment;
  onClose: () => void;
  onEdit: () => void;
}

export function AppointmentDetailModal({ appointment, onClose, onEdit }: AppointmentDetailModalProps) {
  const navigate = useNavigate();
  const checkin = useCheckin(appointment.id);
  const callPatient = useCallPatient(appointment.id);

  const start = new Date(appointment.scheduled_at);
  const end = new Date(appointment.end_at);
  const dateLabel = format(start, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const timeLabel = `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`;

  function handleCheckin() {
    checkin.mutate(undefined, {
      onSuccess: (data) => {
        onClose();
        navigate(`/prontuario/${data.clinical_record_id}`, { state: { from: 'agenda' } });
      },
      onError: () => toast.error('Erro ao iniciar atendimento.'),
    });
  }

  function handleCallPatient() {
    callPatient.mutate(undefined, {
      onError: () => toast.error('Erro ao chamar paciente.'),
    });
  }

  function handleOpenRecord() {
    if (appointment.clinical_record_id) {
      onClose();
      navigate(`/prontuario/${appointment.clinical_record_id}`, { state: { from: 'agenda' } });
    }
  }

  const actionButtons = (() => {
    switch (appointment.status) {
      case 'scheduled':
        return (
          <>
            <Button size="sm" variant="secondary" onClick={handleCallPatient} loading={callPatient.isPending}>
              <Bell className="h-3.5 w-3.5" />
              {callPatient.isPending ? 'Chamando...' : 'Chamar Paciente'}
            </Button>
            <Button size="sm" onClick={handleCheckin} loading={checkin.isPending}>
              <Play className="h-3.5 w-3.5" />
              {checkin.isPending ? 'Iniciando...' : 'Iniciar Atendimento'}
            </Button>
          </>
        );
      case 'waiting':
        return (
          <Button size="sm" onClick={handleCheckin} loading={checkin.isPending}>
            <Play className="h-3.5 w-3.5" />
            {checkin.isPending ? 'Iniciando...' : 'Iniciar Atendimento'}
          </Button>
        );
      case 'in_progress':
        return (
          <Button size="sm" variant="ghost" onClick={handleOpenRecord}>
            <FileText className="h-3.5 w-3.5" />
            Abrir Prontuário
          </Button>
        );
      case 'completed':
        return (
          <Button size="sm" variant="ghost" onClick={handleOpenRecord}>
            <FileText className="h-3.5 w-3.5" />
            Ver Prontuário
          </Button>
        );
      default:
        return null;
    }
  })();

  return (
    <Modal
      title="Detalhes da Consulta"
      onClose={onClose}
      size="md"
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>Fechar</Button>
            <Button variant="secondary" size="sm" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          </div>
          {actionButtons && <div className="flex gap-2">{actionButtons}</div>}
        </div>
      }
    >
      {appointment.booking_fee_required && !appointment.booking_fee_paid && (
        <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Taxa de agendamento pendente — R$ {appointment.booking_fee_amount}
        </div>
      )}

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
        <div className="flex justify-between items-center">
          <dt className="font-medium text-gray-500">Tipo</dt>
          <dd><AppointmentTypeBadge appointmentType={appointment.appointment_type} /></dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="font-medium text-gray-500">Status</dt>
          <dd><StatusBadge type="appointment" status={appointment.status as AppointmentStatus} /></dd>
        </div>
      </dl>
    </Modal>
  );
}
