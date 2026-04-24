export type AppointmentStatus =
  | 'pending_payment'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Professional {
  id: string;
  name: string;
  color: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface SessionPackage {
  id: string;
  patient: string;
  name: string;
  total_sessions: number;
  remaining_sessions: number;
  price: string;
  valid_until: string | null;
  is_valid: boolean;
}

export interface AppointmentExtendedProps {
  status: AppointmentStatus;
  patient_id: string;
  appointment_type: string;
  booking_fee_required: boolean;
  booking_fee_paid: boolean;
  package_warning?: string;
}

export interface Appointment {
  id: string;
  patient: string;
  patient_name: string;
  professional: string;
  professional_name: string;
  appointment_type: string;
  status: AppointmentStatus;
  scheduled_at: string;
  end_at: string;
  booking_fee_required: boolean;
  booking_fee_paid: boolean;
  booking_fee_amount: string | null;
  // FullCalendar shape
  resourceId: string;
  title: string;
  start: string;
  end: string;
  extendedProps: AppointmentExtendedProps;
}

export interface AppointmentCreate {
  patient: string;
  professional: string;
  scheduled_at: string;
  end_at: string;
  appointment_type?: string;
  notes?: string;
  session_package?: string;
}

export interface ProfessionalSchedule {
  id: string;
  professional: string;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
}

export interface PaginatedAppointments {
  count: number;
  next: string | null;
  previous: string | null;
  results: Appointment[];
}
