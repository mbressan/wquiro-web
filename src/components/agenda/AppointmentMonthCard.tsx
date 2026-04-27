import type { Appointment } from '@/types/appointment';

interface AppointmentMonthCardProps {
  appointment: Appointment;
  professionalColor: string;
}

export function AppointmentMonthCard({ appointment, professionalColor }: AppointmentMonthCardProps) {
  return (
    <div className="flex items-center gap-1 px-1 text-xs truncate">
      <span
        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: professionalColor }}
      />
      <span className="truncate">{appointment.patient_name}</span>
    </div>
  );
}
