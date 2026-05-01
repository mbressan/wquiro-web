import { toast } from 'sonner';
import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Clock, Lock } from 'lucide-react';
import { PageHeaderBack, StatusBadge, PageContainer, SkeletonPage, Button } from '@/components/ui';
import type { RecordType } from '@/components/ui';
import { useRecord, useUpdateRecord } from '@/hooks/useRecords';
import { useAppointment, useFinalizeAppointment } from '@/hooks/useAppointments';
import { ConsultationTimer } from '@/components/agenda/ConsultationTimer';
import { Modal } from '@/components/ui/Modal';
import { AnamnesisForm } from '@/components/prontuario/AnamnesisForm';
import { SOAPForm } from '@/components/prontuario/SOAPForm';
import { ExamUpload } from '@/components/prontuario/ExamUpload';
import { PatientHistoryPanel } from '@/components/prontuario/PatientHistoryPanel';
import { PosturalAssessmentForm } from '@/components/prontuario/postural/PosturalAssessmentForm';
import RecordingButton from '@/components/prontuario/RecordingButton';
import TranscriptionReview from '@/components/prontuario/TranscriptionReview';
import { emptyPosturalAssessment } from '@/lib/posture-constants';
import type { PosturalAssessment } from '@/types/posture';
import type { AnamnesisClinicalData, ClinicalData, FollowUpClinicalData, SpineMap } from '@/types/record';
import type { ConsultationRecording } from '@/types/recording';
import { useAuthStore } from '@/stores/authStore';


export default function ProntuarioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { data: record, isLoading, isError } = useRecord(id);
  const { data: appointment } = useAppointment(record?.appointment);
  const update = useUpdateRecord(id!);
  const finalize = useFinalizeAppointment(record?.appointment ?? '');

  const [posturalAssessment, setPosturalAssessment] = useState<PosturalAssessment | undefined>(
    undefined,
  );
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const subscription = useAuthStore((s) => s.subscription);
  const hasAi = subscription?.plan?.has_ai ?? false;

  const resolvedPostural =
    posturalAssessment ??
    (record?.clinical_data as AnamnesisClinicalData | undefined)?.posture_assessment;

  if (isLoading) return <SkeletonPage />;
  if (isError || !record) return <div className="p-8 text-center text-red-500">Prontuário não encontrado.</div>;

  const showPosturalForm =
    record.record_type === 'anamnesis' || record.record_type === 'reevaluation';

  const isInProgress = appointment?.status === 'in_progress';
  const isLocked = record.is_locked;

  function buildClinicalData(formData: Record<string, unknown>): ClinicalData {
    const EXCLUDED_FROM_DIRECT = new Set([
      'subjective', 'objective', 'assessment', 'plan',
      'spine_map', 'medications', 'techniques_used',
    ]);

    const clinical_data: Record<string, unknown> = {
      ...(record?.clinical_data ?? {}),
      ...Object.fromEntries(Object.entries(formData).filter(([k]) => !EXCLUDED_FROM_DIRECT.has(k))),
    };

    const spineMap = formData['spine_map'] as SpineMap | undefined;
    if (spineMap) {
      clinical_data.spine_map = spineMap;
    }

    const medications = formData['medications'] as string | undefined;
    if (typeof medications === 'string') {
      clinical_data.medications = medications.split(',').map((m: string) => m.trim()).filter(Boolean);
    }

    const techniques_used = formData['techniques_used'] as string | undefined;
    if (typeof techniques_used === 'string') {
      clinical_data.techniques_used = techniques_used.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    if (showPosturalForm && resolvedPostural) {
      clinical_data.posture_assessment = resolvedPostural;
    }

    return clinical_data as ClinicalData;
  }

  function handleSubmit(formData: Record<string, unknown>) {
    const subjective = formData['subjective'] as string | undefined;
    const objective = formData['objective'] as string | undefined;
    const assessment = formData['assessment'] as string | undefined;
    const plan = formData['plan'] as string | undefined;

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

  function handleFinalize() {
    finalize.mutate(undefined, {
      onSuccess: () => {
        setShowFinalizeDialog(false);
        toast.success('Atendimento finalizado!');
      },
      onError: () => {
        setShowFinalizeDialog(false);
        toast.error('Erro ao finalizar atendimento.');
      },
    });
  }

  return (
    <PageContainer size="md">
      <PageHeaderBack
        title="Prontuário"
        onBack={() => (location.state?.from === 'agenda' ? navigate('/agenda') : navigate(-1))}
        backLabel={location.state?.from === 'agenda' ? 'Agenda' : 'Voltar'}
        badge={<StatusBadge type="record" status={record.record_type as RecordType} />}
      />

      {/* Timer + finalizar quando em atendimento */}
      {isInProgress && (
        <div className="flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
          <div className="flex items-center gap-2 text-violet-700">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Em atendimento</span>
            <span className="font-mono text-sm">
              <ConsultationTimer startedAt={appointment?.started_at} />
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowFinalizeDialog(true)}
          >
            Finalizar Atendimento
          </Button>
        </div>
      )}

      {/* Banner de prontuário bloqueado */}
      {isLocked && (
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <Lock className="h-4 w-4 shrink-0" />
          Prontuário finalizado — somente leitura
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <fieldset disabled={isLocked} className="disabled:opacity-60">
              {record.record_type === 'anamnesis' ? (
                <AnamnesisForm
                  defaultValues={(() => {
                    const cd = record.clinical_data as AnamnesisClinicalData;
                    return {
                      subjective: record.subjective,
                      objective: record.objective,
                      assessment: record.assessment,
                      plan: record.plan,
                      pain_scale: cd?.pain_scale,
                      pain_locations: cd?.pain_locations ?? [],
                      spine_map: cd?.spine_map,
                      medications: (cd?.medications ?? []).join(', '),
                      occupation: cd?.occupation,
                      chief_complaint: cd?.chief_complaint,
                      hma: cd?.hma,
                      past_history: cd?.past_history,
                    };
                  })()}
                  onSubmit={handleSubmit}
                  isLoading={update.isPending}
                  posturalAssessment={resolvedPostural}
                  onPosturalAssessmentChange={setPosturalAssessment}
                />
              ) : (
                <SOAPForm
                  defaultValues={(() => {
                    const cd = record.clinical_data as FollowUpClinicalData;
                    return {
                      subjective: record.subjective,
                      objective: record.objective,
                      assessment: record.assessment,
                      plan: record.plan,
                      pain_scale: cd?.pain_scale,
                      pain_locations: cd?.pain_locations ?? [],
                      spine_map: cd?.spine_map,
                      patient_feedback: cd?.patient_feedback,
                      techniques_used: (cd?.techniques_used ?? []).join(', '),
                    };
                  })()}
                  onSubmit={handleSubmit}
                  isLoading={update.isPending}
                />
              )}
            </fieldset>
          </div>

          {showPosturalForm && record.record_type === 'reevaluation' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Avaliação Postural</h3>
              </div>
              <div className="p-5">
                <fieldset disabled={isLocked} className="disabled:opacity-60">
                  <PosturalAssessmentForm
                    value={resolvedPostural ?? emptyPosturalAssessment()}
                    onChange={setPosturalAssessment}
                  />
                </fieldset>
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

          {hasAi && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Gravação e Transcrição</h3>
              </div>
              <div className="p-4 space-y-4">
                <RecordingButton
                  clinicalRecordId={record.id}
                  onRecordingUploaded={(rec: ConsultationRecording) => setActiveRecordingId(rec.id)}
                />
                {activeRecordingId && (
                  <TranscriptionReview
                    recordingId={activeRecordingId}
                    clinicalRecordId={record.id}
                    onApplied={() => setActiveRecordingId(null)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showFinalizeDialog && (
        <Modal
          title="Finalizar Atendimento"
          onClose={() => setShowFinalizeDialog(false)}
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowFinalizeDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleFinalize} loading={finalize.isPending}>
                {finalize.isPending ? 'Finalizando...' : 'Confirmar Finalização'}
              </Button>
            </div>
          }
        >
          <p className="text-sm text-gray-600">
            Tem certeza que deseja finalizar este atendimento? O prontuário será bloqueado para edição.
          </p>
        </Modal>
      )}
    </PageContainer>
  );
}
