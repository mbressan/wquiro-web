import { useNavigate, useParams } from 'react-router-dom';
import { FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { usePatientRecords } from '@/hooks/useRecords';
import { PageHeaderBack, StatusBadge, PageContainer } from '@/components/ui';
import type { ClinicalRecordListItem } from '@/types/record';

function RecordCard({ record }: { record: ClinicalRecordListItem }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/prontuario/${record.id}`)}
      className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-primary-200 hover:shadow"
    >
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">
              {new Date(record.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <StatusBadge type="record" status={record.record_type as any} />
            {record.pain_scale !== null && (
              <span className="text-xs text-orange-600">EVA {record.pain_scale}/10</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{record.professional_name}</p>
          {record.soap_summary && (
            <p className="text-sm text-gray-600 line-clamp-2">{record.soap_summary}</p>
          )}
          {record.spine_adjusted.length > 0 && (
            <p className="text-xs text-blue-600">
              Vértebras ajustadas: {record.spine_adjusted.join(', ')}
            </p>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
    </button>
  );
}

export default function PatientProntuarioPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { data: records, isLoading, isError } = usePatientRecords(patientId);

  return (
    <PageContainer size="sm">
      <PageHeaderBack title="Prontuários" onBack={() => navigate(-1)} />

      {isLoading && (
        <p className="py-12 text-center text-sm text-gray-400">Carregando registros...</p>
      )}

      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          Erro ao carregar prontuários.
        </div>
      )}

      {!isLoading && !isError && records?.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p>Nenhum prontuário encontrado.</p>
          <p className="mt-1 text-xs">Os registros são criados ao iniciar um atendimento na agenda.</p>
        </div>
      )}

      {!isLoading && !isError && records && records.length > 0 && (
        <div className="space-y-3">
          {records.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
