import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { useRecord, useUpdateRecord } from '@/hooks/useRecords';
import { AnamnesisForm } from '@/components/prontuario/AnamnesisForm';
import { SOAPForm } from '@/components/prontuario/SOAPForm';
import { ExamUpload } from '@/components/prontuario/ExamUpload';
import { PatientHistoryPanel } from '@/components/prontuario/PatientHistoryPanel';

export default function ProntuarioPage() {
  const { id } = useParams<{ id: string }>();
  const { data: record, isLoading, isError } = useRecord(id);
  const update = useUpdateRecord(id!);

  if (isLoading) return <div className="p-8 text-center text-gray-400">Carregando prontuário...</div>;
  if (isError || !record) return <div className="p-8 text-center text-red-500">Prontuário não encontrado.</div>;

  function handleSubmit(formData: Record<string, unknown>) {
    const { spine_adjusted, medications, techniques_used, pain_locations, pain_scale, ...soapFields } = formData as any;

    const clinical_data: Record<string, unknown> = {
      ...(record?.clinical_data ?? {}),
      ...Object.fromEntries(Object.entries(formData).filter(([k]) =>
        !['subjective', 'objective', 'assessment', 'plan', 'spine_adjusted'].includes(k)
      )),
    };

    if (spine_adjusted) {
      clinical_data.spine_map = { adjusted: spine_adjusted };
    }
    if (typeof medications === 'string') {
      clinical_data.medications = medications.split(',').map((m: string) => m.trim()).filter(Boolean);
    }
    if (typeof techniques_used === 'string') {
      clinical_data.techniques_used = techniques_used.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    update.mutate(
      {
        subjective: soapFields.subjective,
        objective: soapFields.objective,
        assessment: soapFields.assessment,
        plan: soapFields.plan,
        clinical_data,
      },
      {
        onSuccess: () => toast.success('Prontuário salvo!'),
        onError: () => toast.error('Erro ao salvar prontuário.'),
      },
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Prontuário</h1>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
          {record.record_type === 'anamnesis' ? 'Anamnese' : 'Retorno/Evolução'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6 shadow-sm">
          {record.record_type === 'anamnesis' ? (
            <AnamnesisForm
              defaultValues={{
                subjective: record.subjective,
                objective: record.objective,
                assessment: record.assessment,
                plan: record.plan,
                pain_scale: (record.clinical_data as any)?.pain_scale,
                pain_locations: (record.clinical_data as any)?.pain_locations ?? [],
                spine_adjusted: (record.clinical_data as any)?.spine_map?.adjusted ?? [],
                medications: ((record.clinical_data as any)?.medications ?? []).join(', '),
                occupation: (record.clinical_data as any)?.occupation,
                chief_complaint: (record.clinical_data as any)?.chief_complaint,
                hma: (record.clinical_data as any)?.hma,
                past_history: (record.clinical_data as any)?.past_history,
              }}
              onSubmit={handleSubmit}
              isLoading={update.isPending}
            />
          ) : (
            <SOAPForm
              defaultValues={{
                subjective: record.subjective,
                objective: record.objective,
                assessment: record.assessment,
                plan: record.plan,
                pain_scale: (record.clinical_data as any)?.pain_scale,
                pain_locations: (record.clinical_data as any)?.pain_locations ?? [],
                spine_adjusted: (record.clinical_data as any)?.spine_map?.adjusted ?? [],
                patient_feedback: (record.clinical_data as any)?.patient_feedback,
                techniques_used: ((record.clinical_data as any)?.techniques_used ?? []).join(', '),
              }}
              onSubmit={handleSubmit}
              isLoading={update.isPending}
            />
          )}
        </div>

        <div className="space-y-4">
          <PatientHistoryPanel patientId={record.patient} currentRecordId={record.id} />
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <ExamUpload recordId={record.id} exams={record.exam_files} />
          </div>
        </div>
      </div>
    </div>
  );
}
