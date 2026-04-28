import { useState } from 'react';
import { Plus, CalendarX } from 'lucide-react';
import { PageHeader, Button, PageContainer } from '@/components/ui';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAppointments, useCreateAppointment, APPOINTMENTS_KEY } from '@/hooks/useAppointments';
import { useProfessionals } from '@/hooks/useProfessionals';
import { useAgendaContext } from '@/hooks/useAgendaContext';
import { useAgendaView } from '@/hooks/useAgendaView';
import { useAgendaEvents, useCreateAgendaEvent, EVENTS_KEY } from '@/hooks/useAgendaEvents';
import api from '@/lib/api';
import { AgendaCalendar } from '@/components/agenda/AgendaCalendar';
import { AppointmentModal } from '@/components/agenda/AppointmentModal';
import { AppointmentDetailModal } from '@/components/agenda/AppointmentDetailModal';
import { AgendaEventModal } from '@/components/agenda/AgendaEventModal';
import { BookingFeeAlert } from '@/components/agenda/BookingFeeAlert';
import type { Appointment, AppointmentCreate } from '@/types/appointment';
import type { AgendaEventCreate } from '@/types/agenda';

// Fallback palette para profissionais sem cor definida no servidor
const PROF_PALETTE = [
  '#0d9488', '#10b981', '#06b6d4', '#f59e0b',
  '#ef4444', '#84cc16', '#f97316', '#3b82f6',
  '#ec4899', '#8b5cf6',
]

export default function AgendaPage() {
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useAgendaView();
  const [showModal, setShowModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [defaultDate, setDefaultDate] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);

  const [agendaContext, setAgendaContext] = useAgendaContext();

  const { data: professionalsData } = useProfessionals();
  const professionals = professionalsData ?? [];

  const apptFilters = {
    ...(dateRange ? { date_from: dateRange.from, date_to: dateRange.to } : {}),
    ...(agendaContext ? { professional: agendaContext } : {}),
  };
  const { data: appointmentsData } = useAppointments(apptFilters);
  const appointments = appointmentsData?.results ?? [];

  const eventFilters = {
    ...(dateRange ? { date_from: dateRange.from, date_to: dateRange.to } : {}),
    ...(agendaContext ? { professional: agendaContext } : {}),
  };
  const { data: agendaEvents = [] } = useAgendaEvents(eventFilters);

  const createAppt = useCreateAppointment();
  const createEvent = useCreateAgendaEvent();

  function handleDatesChange(start: Date, end: Date) {
    setDateRange({
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    });
  }

  function handleCreate(data: AppointmentCreate) {
    createAppt.mutate(data, {
      onSuccess: () => {
        setShowModal(false);
        toast.success('Consulta agendada!');
      },
      onError: (err: unknown) => {
        const e = err as { response?: { status?: number; data?: { scheduled_at?: string[]; detail?: string } } };
        if (e?.response?.status === 409) {
          toast.error('Conflito de horário: o profissional está indisponível neste horário.');
        } else {
          const detail = e?.response?.data?.scheduled_at?.[0] ?? e?.response?.data?.detail ?? 'Erro ao agendar.';
          toast.error(detail);
        }
      },
    });
  }

  function handleCreateEvent(data: AgendaEventCreate) {
    createEvent.mutate(data, {
      onSuccess: () => {
        setShowEventModal(false);
        qc.invalidateQueries({ queryKey: [EVENTS_KEY] });
        toast.success('Evento criado!');
      },
      onError: () => toast.error('Erro ao criar evento.'),
    });
  }

  async function handleEventDrop(id: string, newStart: string, newEnd: string, revert: () => void) {
    try {
      await api.patch(`/consultas/${id}/`, { scheduled_at: newStart, end_at: newEnd });
      qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    } catch {
      revert();
      toast.error('Conflito de horário — reagendamento revertido.');
    }
  }

  const eventBackgrounds = agendaEvents.map((ev) => ({
    id: `event-${ev.id}`,
    start: ev.start_at,
    end: ev.end_at,
    display: 'background' as const,
    color: '#fee2e2',
    extendedProps: { isAgendaEvent: true, title: ev.title, event_type: ev.event_type },
  }));

  const isGeneralView = !agendaContext;
  const selectedProfessional = professionals.find((p) => p.id === agendaContext);

  return (
    <PageContainer size="xl">
      <PageHeader
        title="Agenda"
        subtitle={
          `${appointments.length} consulta${appointments.length !== 1 ? 's' : ''} no período` +
          (selectedProfessional ? ` · ${selectedProfessional.name}` : '')
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" /> Nova Consulta
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowEventModal(true)}>
              <CalendarX className="h-4 w-4" /> Bloquear horário
            </Button>
          </div>
        }
      />

      {/* Seletor de profissional — pill buttons com ponto de cor */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setAgendaContext(undefined)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
            isGeneralView
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Geral
        </button>

        {professionals.map((p, i) => {
          const color = p.color || PROF_PALETTE[i % PROF_PALETTE.length]
          const isActive = agendaContext === p.id
          return (
            <button
              key={p.id}
              onClick={() => setAgendaContext(p.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border leading-tight ${
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
              style={isActive ? { backgroundColor: color, borderColor: color } : {}}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.8)' : color }}
              />
              {p.name}
            </button>
          )
        })}
      </div>

      {/* Legenda — somente na visão geral */}
      {isGeneralView && professionals.length > 0 && (
        <div className="flex items-center gap-4 px-1 flex-wrap">
          <span className="text-xs font-medium text-gray-500">Profissionais:</span>
          {professionals.map((p, i) => {
            const color = p.color || PROF_PALETTE[i % PROF_PALETTE.length]
            return (
              <span key={p.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                {p.name}
              </span>
            )
          })}
        </div>
      )}

      {/* Alertas de taxa de agendamento */}
      <div className="space-y-2">
        {appointments
          .filter((a) => a.booking_fee_required && !a.booking_fee_paid)
          .slice(0, 3)
          .map((a) => (
            <BookingFeeAlert key={a.id} appointment={a} />
          ))}
      </div>

      <AgendaCalendar
        appointments={appointments}
        professionals={professionals}
        profPalette={PROF_PALETTE}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        agendaContext={agendaContext}
        backgroundEvents={eventBackgrounds}
        onDatesChange={handleDatesChange}
        onDateClick={(date) => {
          setDefaultDate(date + 'T09:00');
          setShowModal(true);
        }}
        onEventClick={setSelectedAppointment}
        onEventDrop={handleEventDrop}
      />

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onEdit={() => {
            setDefaultDate(selectedAppointment.scheduled_at);
            setSelectedAppointment(null);
            setShowModal(true);
          }}
        />
      )}

      {showModal && (
        <AppointmentModal
          defaultDate={defaultDate}
          onSubmit={handleCreate}
          isLoading={createAppt.isPending}
          error={createAppt.isError ? 'Erro ao agendar. Verifique os dados.' : null}
          onClose={() => setShowModal(false)}
        />
      )}

      {showEventModal && (
        <AgendaEventModal
          defaultProfessional={agendaContext}
          defaultStart={defaultDate}
          onSubmit={handleCreateEvent}
          onClose={() => setShowEventModal(false)}
          isLoading={createEvent.isPending}
          error={createEvent.isError ? 'Erro ao criar evento.' : null}
        />
      )}
    </PageContainer>
  );
}
