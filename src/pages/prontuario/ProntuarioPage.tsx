import { toast } from 'sonner';
import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PageHeaderBack, StatusBadge, PageContainer, SkeletonPage } from '@/components/ui';
import { useRecord, useUpdateRecord } from '@/hooks/useRecords';
import { AnamnesisForm } from '@/components/prontuario/AnamnesisForm';
import { SOAPForm } from '@/components/prontuario/SOAPForm';
import { ExamUpload } from '@/components/prontuario/ExamUpload';
import { PatientHistoryPanel } from '@/components/prontuario/PatientHistoryPanel';
import { PosturalAssessmentForm } from '@/components/prontuario/postural/PosturalAssessmentForm';
import { emptyPosturalAssessment } from '@/lib/posture-constants';
import type { PosturalAssessment } from '@/types/posture';


export default function ProntuarioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { data: record, isLoading, isError } = useRecord(id);
  const update = useUpdateRecord(id!);

  const [posturalAssessment, setPosturalAssessment] = useState<PosturalAssessment | undefined>(
    undefined,
  );

  // Initialise posturalAssessment from loaded record (only once)
  const resolvedPostural =
    posturalAssessment ??
    ((record?.clinical_data as any)?.posture_assessment as PosturalAssessment | undefined);

  if (isLoading) return <SkeletonPage />;
  if (isError || !record) return <div className="p-8 text-center text-red-500">Prontuário não encontrado.</div>;

  const showPosturalForm =
    record.record_type === 'anamnesis' || record.record_type === 'reevaluation';

  function buildClinicalData(formData: Record<string, unknown>): Record<string, unknown> {
    const EXCLUDED_FROM_DIRECT = new Set([
      'subjective', 'objective', 'assessment', 'plan',
      'spine_map', 'medications', 'techniques_used',
    ]);

    const clinical_data: Record<string, unknown> = {
      ...(record?.clinical_data ?? {}),
      ...Object.fromEntries(Object.entries(formData).filter(([k]) => !EXCLUDED_FROM_DIRECT.has(k))),
    };

    const spineMap = (formData as any).spine_map;
    if (spineMap) {
      clinical_data.spine_map = spineMap;
    }

    const medications = (formData as any).medications;
    if (typeof medications === 'string') {
      clinical_data.medications = medications.split(',').map((m: string) => m.trim()).filter(Boolean);
    }

    const techniques_used = (formData as any).techniques_used;
    if (typeof techniques_used === 'string') {
      clinical_data.techniques_used = techniques_used.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    if (showPosturalForm && resolvedPostural) {
      clinical_data.posture_assessment = resolvedPostural;
    }

    return clinical_data;
  }

  function handleSubmit(formData: Record<string, unknown>) {
    const { subjective, objective, assessment, plan } = formData as any;

    update.mutate(
      {
        subjective,
        objective,
        assessment,
        plan,
        clinical_data: buildClinicalData(formData),
      },
      {
        onSuccess: () => toast.success('Prontuário salvo!'),
        onError: () => toast.error('Erro ao salvar prontuário.'),
      },
    );
  }

  return (
    <PageContainer size="md">
      <PageHeaderBack
        title="Prontuário"
        onBack={() => (location.state?.from === 'agenda' ? navigate('/agenda') : navigate(-1))}
        backLabel={location.state?.from === 'agenda' ? 'Agenda' : 'Voltar'}
        badge={<StatusBadge type="record" status={record.record_type as any} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {record.record_type === 'anamnesis' ? (
              <AnamnesisForm
                defaultValues={{
                  subjective: record.subjective,
                  objective: record.objective,
                  assessment: record.assessment,
                  plan: record.plan,
                  pain_scale: (record.clinical_data as any)?.pain_scale,
                  pain_locations: (record.clinical_data as any)?.pain_locations ?? [],
                  spine_map: (record.clinical_data as any)?.spine_map,
                  medications: ((record.clinical_data as any)?.medications ?? []).join(', '),
                  occupation: (record.clinical_data as any)?.occupation,
                  chief_complaint: (record.clinical_data as any)?.chief_complaint,
                  hma: (record.clinical_data as any)?.hma,
                  past_history: (record.clinical_data as any)?.past_history,
                }}
                onSubmit={handleSubmit}
                isLoading={update.isPending}
                posturalAssessment={resolvedPostural}
                onPosturalAssessmentChange={setPosturalAssessment}
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
                  spine_map: (record.clinical_data as any)?.spine_map,
                  patient_feedback: (record.clinical_data as any)?.patient_feedback,
                  techniques_used: ((record.clinical_data as any)?.techniques_used ?? []).join(', '),
                }}
                onSubmit={handleSubmit}
                isLoading={update.isPending}
              />
            )}
          </div>

          {showPosturalForm && record.record_type === 'reevaluation' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Avaliação Postural</h3>
              </div>
              <div className="p-5">
                <PosturalAssessmentForm
                  value={resolvedPostural ?? emptyPosturalAssessment()}
                  onChange={setPosturalAssessment}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <PatientHistoryPanel patientId={record.patient} currentRecordId={record.id} />
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Exames</h3>
            </div>
            <div className="p-4">
              <ExamUpload recordId={record.id} exams={record.exam_files} />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
