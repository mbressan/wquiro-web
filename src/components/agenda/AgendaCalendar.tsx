import FullCalendar from '@fullcalendar/react';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentCard } from './AppointmentCard';
import type { Appointment, Professional } from '@/types/appointment';

type ViewMode = 'resourceTimeGridDay' | 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';

interface AgendaCalendarProps {
  appointments: Appointment[];
  professionals: Professional[];
  viewMode: ViewMode;
  backgroundEvents?: object[];
  onDateClick?: (date: string) => void;
  onEventClick?: (appointment: Appointment) => void;
  onEventDrop?: (appointmentId: string, newStart: string, newEnd: string, revert: () => void) => void;
}

export function AgendaCalendar({
  appointments,
  professionals,
  viewMode,
  backgroundEvents = [],
  onDateClick,
  onEventClick,
  onEventDrop,
}: AgendaCalendarProps) {
  const resources = professionals.map((p) => ({
    id: p.id,
    title: p.name,
    eventColor: p.color,
  }));

  const events = [
    ...appointments.map((a) => ({
      id: a.id,
      resourceId: a.resourceId,
      title: a.title,
      start: a.start,
      end: a.end,
      backgroundColor: professionals.find((p) => p.id === a.professional)?.color ?? '#3b82f6',
      extendedProps: { ...a.extendedProps, _appointment: a },
    })),
    ...backgroundEvents,
  ];

  return (
    <div className="rounded-lg border bg-white p-2 shadow-sm overflow-auto">
      <FullCalendar
        plugins={[resourceTimeGridPlugin, timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView={viewMode}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        locale="pt-br"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        resources={resources}
        events={events}
        editable
        droppable
        eventContent={(arg) => {
          const appt = arg.event.extendedProps._appointment as Appointment;
          return <AppointmentCard appointment={appt} />;
        }}
        dateClick={(info) => onDateClick?.(info.dateStr)}
        eventClick={(info) => {
          const appt = info.event.extendedProps._appointment as Appointment;
          onEventClick?.(appt);
        }}
        eventDrop={(info) => {
          const appt = info.event.extendedProps._appointment as Appointment;
          onEventDrop?.(
            appt.id,
            info.event.startStr,
            info.event.endStr ?? '',
            info.revert,
          );
        }}
        height="auto"
      />
    </div>
  );
}
