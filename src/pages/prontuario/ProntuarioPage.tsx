import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lock } from 'lucide-react';
import { SkeletonPage } from '@/components/ui';
import { useRecord, useUpdateRecord, usePatientRecords } from '@/hooks/useRecords';
import { useAppointment, useCheckin } from '@/hooks/useAppointments';
import { FinalizarDrawer } from '@/components/prontuario/FinalizarDrawer';
import { usePatient } from '@/hooks/usePatients';
import { AnamnesisForm } from '@/components/prontuario/AnamnesisForm';
import { SOAPForm } from '@/components/prontuario/SOAPForm';
import { ExamUpload } from '@/components/prontuario/ExamUpload';
import { PatientHistoryPanel } from '@/components/prontuario/PatientHistoryPanel';
import { PosturalAssessmentForm } from '@/components/prontuario/postural/PosturalAssessmentForm';
import RecordingButton from '@/components/prontuario/RecordingButton';
import TranscriptionReview from '@/components/prontuario/TranscriptionReview';
import { ProntuarioSidebar } from '@/components/prontuario/ProntuarioSidebar';
import { PatientSummaryCard } from '@/components/prontuario/PatientSummaryCard';
import { AnamnesisInlineFields } from '@/components/prontuario/AnamnesisInlineFields';
import { DiagnosticsSection } from '@/components/prontuario/DiagnosticsSection';
import { TagsSection } from '@/components/prontuario/TagsSection';
import { PreviousRecordsImport } from '@/components/prontuario/PreviousRecordsImport';
import { emptyPosturalAssessment } from '@/lib/posture-constants';
import type { PosturalAssessment } from '@/types/posture';
import type { AnamnesisClinicalData, ClinicalData, FollowUpClinicalData, SpineMap } from '@/types/record';
import type { ConsultationRecording } from '@/types/recording';
import type { SectionKey } from '@/components/prontuario/ProntuarioSidebar';
import { useAuthStore } from '@/stores/authStore';

export default function ProntuarioPage() {
  const { id } = useParams<{ id: string }>();
  const { data: record, isLoading, isError, refetch: refetchRecord } = useRecord(id);
  const { data: appointment, isLoading: isAppointmentLoading, refetch: refetchAppointment } = useAppointment(record?.appointment);
  const { data: patient } = usePatient(record?.patient ?? '');
  const { data: records = [] } = usePatientRecords(record?.patient);
  const update = useUpdateRecord(id!);
  const checkin = useCheckin(record?.appointment ?? '');
  const [showFinalizarDrawer, setShowFinalizarDrawer] = useState(false);

  const handleInitiate = async () => {
    if (appointment?.status === 'in_progress') {
      await refetchAppointment();
      return;
    }
    try {
      await checkin.mutateAsync();
      await refetchAppointment();
    } catch {
      toast.error('Erro ao iniciar atendimento.');
    }
  };

  const handleFinalize = () => setShowFinalizarDrawer(true);

  const handleFinalizeSuccess = async () => {
    setShowFinalizarDrawer(false);
    await refetchRecord();
  };

  const [activeSection, setActiveSection] = useState<SectionKey>('form');
  const [posturalAssessment, setPosturalAssessment] = useState<PosturalAssessment | undefined>(undefined);
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);

  const subscription = useAuthStore((s) => s.subscription);
  const hasAi = subscription?.plan?.has_ai ?? false;

  const firstRecord = records.find(r => r.record_type === 'anamnesis');
  const firstConsultationDate = firstRecord
    ? (() => {
        try { return format(parseISO(firstRecord.date), 'dd/MM/yyyy', { locale: ptBR }); }
        catch { return null; }
      })()
    : null;

  const resolvedPostural =
    posturalAssessment ??
    (record?.clinical_data as AnamnesisClinicalData | undefined)?.posture_assessment;

  const showPosturalForm =
    record?.record_type === 'anamnesis' || record?.record_type === 'reevaluation';

  if (isLoading) return <SkeletonPage />;
  if (isError || !record) return <div className="p-8 text-center text-red-500">Prontuário não encontrado.</div>;

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
    if (spineMap) clinical_data.spine_map = spineMap;

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
    update.mutate(
      {
        subjective: formData['subjective'] as string | undefined,
        objective: formData['objective'] as string | undefined,
        assessment: formData['assessment'] as string | undefined,
        plan: formData['plan'] as string | undefined,
        clinical_data: buildClinicalData(formData),
      },
      {
        onSuccess: () => toast.success('Prontuário salvo!'),
        onError: () => toast.error('Erro ao salvar prontuário.'),
      },
    );
  }

  const isLocked = record.is_locked;

  return (
    <div className="flex h-full w-full overflow-hidden">
      <ProntuarioSidebar
        record={record}
        appointment={appointment ?? null}
        appointmentLoading={isAppointmentLoading}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onInitiate={handleInitiate}
        onFinalize={handleFinalize}
      />
      <main className="flex-1 overflow-y-auto">
        {isLocked && (
          <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800 sticky top-0 z-10 mx-4 mt-2">
            <Lock className="h-4 w-4" />
            <span>Prontuário finalizado — somente leitura</span>
            {record.signature_type !== 'none' && (
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Assinado</span>
            )}
          </div>
        )}
        {patient && (
          <PatientSummaryCard
            patient={patient}
            appointment={appointment ?? null}
            firstConsultationDate={firstConsultationDate}
          />
        )}

        <div className="px-6 py-4 space-y-6">
          <AnamnesisInlineFields record={record} isLocked={isLocked} />

          {activeSection === 'form' && (
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

              {showPosturalForm && record.record_type === 'reevaluation' && (
                <div className="border-t border-gray-100">
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

              {hasAi && (
                <div className="border-t border-gray-100">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-900">Gravação e Transcrição</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <RecordingButton
                      clinicalRecordId={record.id}
                      onRecordingUploaded={(rec: ConsultationRecording) => setActiveRecordingId(rec.id)}
                      disabled={isLocked}
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
          )}

          {activeSection === 'historico' && (
            <PatientHistoryPanel patientId={record.patient} currentRecordId={record.id} />
          )}

          {activeSection === 'exames' && (
            <ExamUpload recordId={record.id} exams={record.exam_files} />
          )}

          {(['prescricoes', 'documentos', 'imagens', 'acompanhamento'] as SectionKey[]).includes(activeSection) && (
            <div className="text-center py-12 text-gray-400 text-sm">Em breve</div>
          )}

          <DiagnosticsSection patientId={record.patient} currentRecordId={record.id} />
          <TagsSection patientId={record.patient} />
          {record.record_type === 'anamnesis' && <PreviousRecordsImport recordId={record.id} />}
        </div>
      </main>
      <FinalizarDrawer
        open={showFinalizarDrawer}
        onClose={() => setShowFinalizarDrawer(false)}
        appointmentId={record.appointment}
        onSuccess={handleFinalizeSuccess}
      />
    </div>
  );
}
