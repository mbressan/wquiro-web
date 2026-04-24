import { StatusBadge } from './StatusBadge';
import type { Appointment } from '@/types/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  const { extendedProps } = appointment;

  return (
    <div
      className="flex flex-col gap-1 p-1 text-xs cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <span className="font-semibold truncate">{appointment.title}</span>
      <StatusBadge status={extendedProps.status} />
      {extendedProps.appointment_type && (
        <span className="text-gray-500 truncate">{extendedProps.appointment_type}</span>
      )}
      {extendedProps.package_warning && (
        <span className="text-orange-600 font-medium">{extendedProps.package_warning}</span>
      )}
      {extendedProps.booking_fee_required && !extendedProps.booking_fee_paid && (
        <span className="text-red-600 font-medium">Taxa pendente</span>
      )}
    </div>
  );
}
