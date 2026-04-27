import { useState } from 'react';
import { Skeleton } from '@/components/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePatientRecords } from '@/hooks/useRecords';
import type { ClinicalRecordListItem } from '@/types/record';

const RECORD_TYPE_LABELS: Record<string, string> = {
  anamnesis: 'Anamnese',
  follow_up: 'Retorno',
  reevaluation: 'Reavaliação',
  discharge: 'Alta',
};

interface PatientHistoryPanelProps {
  patientId: string;
  currentRecordId?: string;
}

function RecordRow({ item }: { item: ClinicalRecordListItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
            {RECORD_TYPE_LABELS[item.record_type] ?? item.record_type}
          </span>
          {item.pain_scale !== null && (
            <span className="text-orange-600 text-xs">EVA {item.pain_scale}/10</span>
          )}
          <span className="text-gray-700 font-medium">{item.professional_name}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-3 text-sm text-gray-600 space-y-1">
          {item.soap_summary && <p>{item.soap_summary}</p>}
          {item.spine_adjusted.length > 0 && (
            <p className="text-blue-600">Coluna: {item.spine_adjusted.join(', ')}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function PatientHistoryPanel({ patientId, currentRecordId }: PatientHistoryPanelProps) {
  const { data: records, isLoading } = usePatientRecords(patientId);

  const history = records?.filter((r) => r.id !== currentRecordId) ?? [];

  if (isLoading) return (
    <div className="rounded-lg border bg-white p-4 space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
  if (history.length === 0) return <p className="text-sm text-gray-400">Sem histórico anterior.</p>;

  return (
    <div className="rounded-lg border bg-white">
      <h3 className="px-4 py-3 text-sm font-semibold text-gray-700 border-b">
        Histórico do Paciente ({history.length})
      </h3>
      <div>
        {history.map((item) => (
          <RecordRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
