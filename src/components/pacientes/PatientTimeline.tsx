import { Calendar, CreditCard, FileText, MessageCircle } from 'lucide-react';
import type { TimelineEvent, TimelineEventType } from '@/types/patient';

const icons: Record<TimelineEventType, React.ReactNode> = {
  appointment: <Calendar className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  exam_upload: <FileText className="h-4 w-4" />,
  whatsapp: <MessageCircle className="h-4 w-4" />,
};

const colors: Record<TimelineEventType, string> = {
  appointment: 'bg-blue-100 text-blue-600',
  payment: 'bg-green-100 text-green-600',
  exam_upload: 'bg-yellow-100 text-yellow-600',
  whatsapp: 'bg-emerald-100 text-emerald-600',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface PatientTimelineProps {
  events: TimelineEvent[];
}

export function PatientTimeline({ events }: PatientTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        Nenhuma atividade registrada ainda.
      </div>
    );
  }

  return (
    <ol className="relative border-l border-gray-200 pl-6">
      {events.map((event, i) => (
        <li key={i} className="mb-6 last:mb-0">
          <span
            className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${colors[event.event_type]}`}
          >
            {icons[event.event_type]}
          </span>
          <time className="mb-1 text-xs text-gray-400">{formatDate(event.date)}</time>
          <p className="text-sm text-gray-700">{event.description}</p>
        </li>
      ))}
    </ol>
  );
}
