import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAppointments, useCreateAppointment, APPOINTMENTS_KEY } from '@/hooks/useAppointments';
import { useProfessionals } from '@/hooks/useProfessionals';
import api from '@/lib/api';
import { AgendaCalendar } from '@/components/agenda/AgendaCalendar';
import { AppointmentModal } from '@/components/agenda/AppointmentModal';
import { BookingFeeAlert } from '@/components/agenda/BookingFeeAlert';
import { ProfessionalColorDot } from '@/components/agenda/ProfessionalColorDot';
import type { Appointment, AppointmentCreate } from '@/types/appointment';

type ViewMode = 'resourceTimeGridDay' | 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth';

export default function AgendaPage() {
  const qc = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('resourceTimeGridDay');
  const [showModal, setShowModal] = useState(false);
  const [, setSelectedAppointment] = useState<Appointment | null>(null);
  const [defaultDate, setDefaultDate] = useState('');
  const [month] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { data: professionalsData } = useProfessionals();
  const professionals = professionalsData ?? [];

  const { data: appointmentsData } = useAppointments({ month });
  const appointments = appointmentsData?.results ?? [];

  const createAppt = useCreateAppointment();

  function handleCreate(data: AppointmentCreate) {
    createAppt.mutate(data, {
      onSuccess: () => {
        setShowModal(false);
        toast.success('Consulta agendada!');
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { scheduled_at?: string[]; detail?: string } } };
        const detail = e?.response?.data?.scheduled_at?.[0] ?? e?.response?.data?.detail ?? 'Erro ao agendar.';
        toast.error(detail);
      },
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <div className="flex gap-2 flex-wrap">
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
        onDateClick={(date) => {
          setDefaultDate(date + 'T09:00');
          setShowModal(true);
        }}
        onEventClick={setSelectedAppointment}
        onEventDrop={handleEventDrop}
      />

      {showModal && (
        <AppointmentModal
          defaultDate={defaultDate}
          onSubmit={handleCreate}
          isLoading={createAppt.isPending}
          error={createAppt.isError ? 'Erro ao agendar. Verifique os dados.' : null}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
