import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, ChevronRight, AlertCircle, FileText, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useAppointments, useCheckin } from '@/hooks/useAppointments';
import type { Appointment } from '@/types/appointment';

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Aguard. pagamento',
  scheduled: 'Agendado',
  in_progress: 'Em atendimento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Falta',
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-500',
};

const TYPE_LABELS: Record<string, string> = {
  evaluation: 'Avaliação',
  follow_up: 'Retorno',
  maintenance: 'Manutenção',
};

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
    <div className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
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
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                STATUS_COLORS[appt.status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {STATUS_LABELS[appt.status] ?? appt.status}
            </span>
            {appt.appointment_type && (
              <span className="text-xs text-gray-500">
                {TYPE_LABELS[appt.appointment_type] ?? appt.appointment_type}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{appt.professional_name}</p>
        </div>
      </div>
      {appt.status === 'completed' && appt.clinical_record_id && (
        <button
          onClick={() => navigate(`/prontuario/${appt.clinical_record_id}`)}
          className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          title="Ver prontuário"
        >
          <FileText className="h-3.5 w-3.5" />
          Prontuário
        </button>
      )}
      {appt.status === 'scheduled' && (
        <button
          onClick={handleCheckin}
          disabled={checkin.isPending}
          className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-60"
          title="Iniciar atendimento"
        >
          <Play className="h-3.5 w-3.5" />
          {checkin.isPending ? 'Iniciando...' : 'Iniciar'}
        </button>
      )}
      {appt.status === 'in_progress' && appt.clinical_record_id && (
        <button
          onClick={() => navigate(`/prontuario/${appt.clinical_record_id}`, { state: { from: 'agenda' } })}
          className="flex items-center gap-1 rounded-md bg-purple-600 px-3 py-1.5 text-xs text-white hover:bg-purple-700"
          title="Continuar atendimento"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          Continuar
        </button>
      )}
    </div>
  );
}

export default function PatientConsultasPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAppointments({ patient: patientId });

  const appointments = data?.results ?? (Array.isArray(data) ? data : []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-1 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Consultas</h1>
      </div>

      {isLoading && (
        <p className="py-12 text-center text-sm text-gray-400">Carregando consultas...</p>
      )}

      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
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
    </div>
  );
}
