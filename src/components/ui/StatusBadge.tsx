// StatusBadge — badge semântico unificado para appointment, record type e invite

export type AppointmentStatus =
  | 'pending_payment'
  | 'scheduled'
  | 'confirmed'
  | 'waiting'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type RecordType = 'anamnesis' | 'follow_up' | 'reevaluation' | 'discharge';

type InviteStatus = 'accepted' | 'cancelled' | 'pending' | 'expired';

const APPOINTMENT_MAP: Record<AppointmentStatus, { label: string; cls: string }> = {
  pending_payment: { label: 'Aguard. pagamento', cls: 'bg-yellow-100 text-yellow-700' },
  scheduled:       { label: 'Agendado',           cls: 'bg-blue-100 text-blue-700' },
  confirmed:       { label: 'Confirmado',          cls: 'bg-emerald-100 text-emerald-700' },
  waiting:         { label: 'Aguardando',          cls: 'bg-yellow-100 text-yellow-700' },
  in_progress:     { label: 'Em atendimento',      cls: 'bg-violet-100 text-violet-700' },
  completed:       { label: 'Concluído',           cls: 'bg-gray-100 text-gray-600' },
  cancelled:       { label: 'Cancelado',           cls: 'bg-red-100 text-red-600' },
  no_show:         { label: 'Não compareceu',      cls: 'bg-orange-100 text-orange-600' },
};

const RECORD_MAP: Record<RecordType, { label: string; cls: string }> = {
  anamnesis:    { label: 'Anamnese',         cls: 'bg-blue-100 text-blue-700' },
  follow_up:    { label: 'Retorno',          cls: 'bg-violet-100 text-violet-700' },
  reevaluation: { label: 'Reavaliação',      cls: 'bg-amber-100 text-amber-700' },
  discharge:    { label: 'Alta',             cls: 'bg-gray-100 text-gray-600' },
};

const INVITE_MAP: Record<InviteStatus, { label: string; cls: string }> = {
  accepted:  { label: 'Aceito',    cls: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelado', cls: 'bg-red-100 text-red-600' },
  pending:   { label: 'Pendente',  cls: 'bg-yellow-100 text-yellow-700' },
  expired:   { label: 'Expirado',  cls: 'bg-gray-100 text-gray-600' },
};

const BASE = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';

interface AppointmentBadgeProps {
  type: 'appointment';
  status: AppointmentStatus;
}
interface RecordBadgeProps {
  type: 'record';
  status: RecordType;
}
interface InviteBadgeProps {
  type: 'invite';
  status: InviteStatus;
}

type StatusBadgeProps = AppointmentBadgeProps | RecordBadgeProps | InviteBadgeProps;

export function StatusBadge(props: StatusBadgeProps) {
  let entry: { label: string; cls: string } | undefined;

  if (props.type === 'appointment') {
    entry = APPOINTMENT_MAP[props.status] ?? { label: props.status, cls: 'bg-gray-100 text-gray-600' };
  } else if (props.type === 'record') {
    entry = RECORD_MAP[props.status] ?? { label: props.status, cls: 'bg-gray-100 text-gray-600' };
  } else {
    entry = INVITE_MAP[props.status] ?? { label: props.status, cls: 'bg-gray-100 text-gray-600' };
  }

  return <span className={[BASE, entry.cls].join(' ')}>{entry.label}</span>;
}

// Conveniência: badge de tipo de consulta (appointment_type)
type AppointmentType = 'evaluation' | 'follow_up' | 'maintenance';
const APPT_TYPE_MAP: Record<AppointmentType, string> = {
  evaluation:  'Avaliação',
  follow_up:   'Retorno',
  maintenance: 'Manutenção',
};

interface AppointmentTypeBadgeProps {
  appointmentType: string;
}

export function AppointmentTypeBadge({ appointmentType }: AppointmentTypeBadgeProps) {
  const label = APPT_TYPE_MAP[appointmentType as AppointmentType] ?? appointmentType;
  return (
    <span className={[BASE, 'bg-gray-100 text-gray-500'].join(' ')}>{label}</span>
  );
}
