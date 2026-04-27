import { useState } from 'react';
import { Plus, CalendarX } from 'lucide-react';
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
import { ContextSelector } from '@/components/agenda/ContextSelector';
import { BookingFeeAlert } from '@/components/agenda/BookingFeeAlert';
import { ProfessionalColorDot } from '@/components/agenda/ProfessionalColorDot';
import type { Appointment, AppointmentCreate } from '@/types/appointment';
import type { AgendaEventCreate } from '@/types/agenda';

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

  // Map AgendaEvents to FullCalendar background events so they appear visually distinct.
  const eventBackgrounds = agendaEvents.map((ev) => ({
    id: `event-${ev.id}`,
    start: ev.start_at,
    end: ev.end_at,
    display: 'background',
    color: '#fee2e2',
    extendedProps: { isAgendaEvent: true, title: ev.title, event_type: ev.event_type },
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <ContextSelector context={agendaContext} onChange={setAgendaContext} />

          <button
            onClick={() => setViewMode('resourceTimeGridDay')}
            className={`rounded-md px-3 py-1.5 text-sm border ${viewMode === 'resourceTimeGridDay' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`}
          >
            Geral (dia)
          </button>
          <button
            onClick={() => setViewMode('timeGridWeek')}
            className={`rounded-md px-3 py-1.5 text-sm border ${viewMode === 'timeGridWeek' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`}
          >
            Semana
          </button>
          <button
            onClick={() => setViewMode('dayGridMonth')}
            className={`rounded-md px-3 py-1.5 text-sm border ${viewMode === 'dayGridMonth' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`}
          >
            Mês
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Nova Consulta
          </button>
          <button
            onClick={() => setShowEventModal(true)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <CalendarX className="h-4 w-4" /> Bloquear horário
          </button>
        </div>
      </div>

      {/* Professional legend */}
      {professionals.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {professionals.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5 text-sm text-gray-700">
              <ProfessionalColorDot color={p.color} size="sm" />
              {p.name}
            </div>
          ))}
        </div>
      )}

      {/* Booking fee alerts */}
      {appointments
        .filter((a) => a.booking_fee_required && !a.booking_fee_paid)
        .slice(0, 3)
        .map((a) => (
          <div key={a.id} className="mb-2">
            <BookingFeeAlert appointment={a} />
          </div>
        ))}

      <AgendaCalendar
        appointments={appointments}
        professionals={professionals}
        viewMode={viewMode}
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
    </div>
  );
}

