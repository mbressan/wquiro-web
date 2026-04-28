import { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentMonthCard } from './AppointmentMonthCard';
import type { ViewMode } from '@/hooks/useAgendaView';
import type { Appointment, AppointmentStatus, Professional } from '@/types/appointment';
import type { AgendaContext } from '@/types/agenda';

// Cores por status — usadas na visão individual (um profissional selecionado)
const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending_payment: '#fbbf24', // amber
  scheduled:       '#38bdf8', // sky
  in_progress:     '#0d9488', // teal
  completed:       '#94a3b8', // slate
  cancelled:       '#f87171', // red
  no_show:         '#fb923c', // orange
}

interface BackgroundEvent {
  id: string
  start: string
  end: string
  display: 'background'
  color?: string
  extendedProps?: Record<string, unknown>
}

interface AgendaCalendarProps {
  appointments: Appointment[];
  professionals: Professional[];
  profPalette: string[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  agendaContext?: AgendaContext;
  backgroundEvents?: BackgroundEvent[];
  onDateClick?: (date: string) => void;
  onEventClick?: (appointment: Appointment) => void;
  onEventDrop?: (appointmentId: string, newStart: string, newEnd: string, revert: () => void) => void;
  onDatesChange?: (start: Date, end: Date) => void;
}

export function AgendaCalendar({
  appointments,
  professionals,
  profPalette,
  viewMode,
  onViewModeChange,
  agendaContext,
  backgroundEvents = [],
  onDateClick,
  onEventClick,
  onEventDrop,
  onDatesChange,
}: AgendaCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const isResourceView = viewMode === 'resourceTimeGridDay';
  const isGeneralView = !agendaContext;

  // Troca de view de forma imperativa quando a prop muda
  useEffect(() => {
    calendarRef.current?.getApi().changeView(viewMode);
  }, [viewMode]);

  const resources = professionals.map((p, i) => ({
    id: p.id,
    title: p.name,
    eventColor: p.color || profPalette[i % profPalette.length],
  }));

  const events = [
    ...appointments.map((a) => {
      const profColor = professionals.find((p) => p.id === a.professional)?.color
        ?? profPalette[professionals.findIndex((p) => p.id === a.professional) % profPalette.length]
        ?? '#3b82f6';
      const color = isGeneralView
        ? profColor
        : (STATUS_COLORS[a.extendedProps.status] ?? profColor);
      return {
        id: a.id,
        resourceId: a.resourceId,
        title: a.title,
        start: a.start,
        end: a.end,
        backgroundColor: color,
        borderColor: color,
        editable: !['completed', 'cancelled', 'no_show'].includes(a.extendedProps.status),
        extendedProps: { ...a.extendedProps, _appointment: a },
      };
    }),
    ...backgroundEvents,
  ];

  const VIEW_OPTIONS = [
    { mode: 'resourceTimeGridDay', label: 'Geral (dia)' },
    { mode: 'timeGridWeek',        label: 'Semana' },
    { mode: 'dayGridMonth',        label: 'Mês' },
  ] as const;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Toggle de visualização */}
      <div className="flex justify-end px-4 pt-3 pb-0">
        <div className="inline-flex overflow-hidden rounded-lg border border-gray-300">
          {VIEW_OPTIONS.map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === mode
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendário */}
      <div className="p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[resourceTimeGridPlugin, timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView={viewMode}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          locale="pt-br"
          slotMinTime="07:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={viewMode === 'dayGridMonth' ? undefined : false}
          resources={isResourceView ? resources : []}
          events={events}
          editable
          droppable
          selectable
          selectMirror
          dayMaxEvents
          datesSet={(dateInfo) => onDatesChange?.(dateInfo.start, dateInfo.end)}
          eventContent={(arg) => {
            const appt = arg.event.extendedProps._appointment as Appointment | undefined;
            if (!appt) return null;

            if (viewMode === 'dayGridMonth') {
              const profColor = professionals.find((p) => p.id === appt.professional)?.color
                ?? profPalette[professionals.findIndex((p) => p.id === appt.professional) % profPalette.length]
                ?? '#3b82f6';
              const color = isGeneralView
                ? profColor
                : (STATUS_COLORS[appt.extendedProps.status] ?? profColor);
              return <AppointmentMonthCard appointment={appt} professionalColor={color} />;
            }

            return (
              <div className="px-1 truncate text-xs font-medium text-white leading-tight py-0.5">
                <span className="opacity-75">{arg.timeText}</span>{' '}
                {arg.event.title}
              </div>
            );
          }}
          dateClick={(info) => onDateClick?.(info.dateStr)}
          eventClick={(info) => {
            const appt = info.event.extendedProps._appointment as Appointment | undefined;
            if (appt) onEventClick?.(appt);
          }}
          eventDrop={(info) => {
            const appt = info.event.extendedProps._appointment as Appointment | undefined;
            if (appt) {
              onEventDrop?.(
                appt.id,
                info.event.startStr,
                info.event.endStr ?? '',
                info.revert,
              );
            }
          }}
          height="auto"
        />
      </div>
    </div>
  );
}
