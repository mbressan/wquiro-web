import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, ChevronRight, AlertCircle, FileText, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useAppointments, useCheckin } from '@/hooks/useAppointments';
import { PageHeaderBack, StatusBadge, AppointmentTypeBadge, Button, PageContainer, SkeletonCardList } from '@/components/ui';
import type { AppointmentStatus } from '@/components/ui';
import type { Appointment } from '@/types/appointment';

function AppointmentCard({ appt }: { appt: Appointment }) {
  const navigate = useNavigate();
  const checkin = useCheckin(appt.id);
  const date = new Date(appt.scheduled_at);

  function handleCheckin() {
    checkin.mutate(undefined, {
      onSuccess: (data) => {
        navigate(`/prontuario/${data.clinical_record_id}`, { state: { from: 'agenda' } });
      },
      onError: () => toast.error('Erro ao iniciar atendimento.'),
    });
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <CalendarDays className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-800">
              {date.toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="text-sm text-gray-500">
              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <StatusBadge type="appointment" status={appt.status as AppointmentStatus} />
            {appt.appointment_type && (
              <AppointmentTypeBadge appointmentType={appt.appointment_type} />
            )}
          </div>
          <p className="text-sm text-gray-500">{appt.professional_name}</p>
        </div>
      </div>
      <div className="shrink-0">
        {appt.status === 'completed' && appt.clinical_record_id && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/prontuario/${appt.clinical_record_id}`)}
          >
            <FileText className="h-3.5 w-3.5" />
            Prontuário
          </Button>
        )}
        {appt.status === 'scheduled' && (
          <Button size="sm" onClick={handleCheckin} loading={checkin.isPending}>
            <Play className="h-3.5 w-3.5" />
            {checkin.isPending ? 'Iniciando...' : 'Iniciar'}
          </Button>
        )}
        {appt.status === 'in_progress' && appt.clinical_record_id && (
          <Button
            size="sm"
            onClick={() => navigate(`/prontuario/${appt.clinical_record_id}`, { state: { from: 'agenda' } })}
          >
            <ChevronRight className="h-3.5 w-3.5" />
            Continuar
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PatientConsultasPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAppointments({ patient: patientId });

  const appointments = data?.results ?? (Array.isArray(data) ? data : []);

  return (
    <PageContainer size="sm">
      <PageHeaderBack title="Consultas" onBack={() => navigate(-1)} />

      {isLoading && <SkeletonCardList cards={5} />}

      {isError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          Erro ao carregar consultas.
        </div>
      )}

      {!isLoading && !isError && appointments.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p>Nenhuma consulta encontrada.</p>
        </div>
      )}

      {!isLoading && !isError && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <AppointmentCard key={appt.id} appt={appt} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
