import { useState } from 'react';
import { Loader2, Sparkles, ClipboardCheck, AlertCircle, Clock } from 'lucide-react';
import { Button, Textarea, Select } from '@/components/ui';
import { toast } from 'sonner';
import { useTranscription, useCategorize, useApplyTranscription } from '@/hooks/useTranscription';
import type { ApplyTranscriptionPayload } from '@/types/recording';

interface TranscriptionReviewProps {
  recordingId: string;
  clinicalRecordId: string;
  onApplied: () => void;
}

const SOAP_FIELDS = [
  { value: 'subjective', label: 'Subjetivo (S)' },
  { value: 'objective',  label: 'Objetivo (O)' },
  { value: 'assessment', label: 'Avaliação (A)' },
  { value: 'plan',       label: 'Plano (P)' },
] as const;

export default function TranscriptionReview({ recordingId, clinicalRecordId, onApplied }: TranscriptionReviewProps) {
  const [editedText, setEditedText] = useState('');
  const [targetField, setTargetField] = useState<string>('subjective');
  const [useAi, setUseAi] = useState(true);

  const { data, isLoading } = useTranscription(recordingId);
  const categorize = useCategorize(recordingId);
  const apply = useApplyTranscription(recordingId, clinicalRecordId);

  const transcription = data?.transcription ?? '';
  const displayText = editedText || transcription;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Carregando transcrição...</span>
      </div>
    );
  }

  if (!data) return null;

  const { transcription_status, ai_categorized } = data;
  const isDelayed = (data as typeof data & { isDelayed?: boolean }).isDelayed;

  if (transcription_status === 'pending' || transcription_status === 'processing') {
    return (
      <div className="space-y-2 py-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>
            {transcription_status === 'pending' ? 'Aguardando processamento...' : 'Transcrevendo áudio...'}
          </span>
        </div>
        {isDelayed && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <Clock className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Processamento demorado. Verifique mais tarde ou contate o suporte.</span>
          </div>
        )}
      </div>
    );
  }

  if (transcription_status === 'failed') {
    return (
      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>Falha na transcrição. Preencha o prontuário manualmente.</span>
      </div>
    );
  }

  const hasAiResult = ai_categorized && !ai_categorized.error && ai_categorized.subjective !== undefined;
  const aiError = ai_categorized?.error;

  const handleApply = async () => {
    let payload: ApplyTranscriptionPayload;

    if (useAi && hasAiResult) {
      payload = { use_ai_categorized: true };
    } else {
      if (!displayText.trim()) {
        toast.error('Texto vazio. Escreva ou edite a transcrição antes de inserir.');
        return;
      }
      payload = {
        use_ai_categorized: false,
        transcription_text: displayText,
        target_field: targetField as ApplyTranscriptionPayload['target_field'],
      };
    }

    try {
      await apply.mutateAsync(payload);
      toast.success('Prontuário atualizado com sucesso.');
      onApplied();
    } catch {
      toast.error('Erro ao aplicar ao prontuário.');
    }
  };

  return (
    <div className="space-y-4">
      {!transcription && (
        <p className="text-sm text-gray-500 italic">Nenhuma fala detectada no áudio.</p>
      )}

      {transcription && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Transcrição</label>
          <Textarea
            value={displayText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedText(e.target.value)}
            rows={5}
            placeholder="Transcrição do áudio..."
            className="font-mono text-sm"
          />
        </div>
      )}

      {hasAiResult && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Categorização SOAP pela IA
          </p>
          {(['subjective', 'objective', 'assessment', 'plan'] as const).map((field) => {
            const labels = { subjective: 'S', objective: 'O', assessment: 'A', plan: 'P' };
            const value = ai_categorized?.[field];
            if (!value) return null;
            return (
              <div key={field} className="text-xs">
                <span className="font-bold text-blue-800">{labels[field]}:</span>{' '}
                <span className="text-blue-700">{value}</span>
              </div>
            );
          })}
        </div>
      )}

      {aiError && (
        <p className="text-xs text-amber-600">{aiError}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!hasAiResult && transcription && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => categorize.mutate()}
            disabled={categorize.isPending}
          >
            {categorize.isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 mr-1" />
            )}
            Categorizar com IA
          </Button>
        )}

        {(!useAi || !hasAiResult) && transcription && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Inserir em:</span>
            <Select
              value={targetField}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetField(e.target.value)}
              className="h-8 w-36 text-xs"
            >
              {SOAP_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </Select>
          </div>
        )}

        {(transcription || hasAiResult) && (
          <Button size="sm" onClick={handleApply} disabled={apply.isPending}>
            {apply.isPending ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
            )}
            {useAi && hasAiResult ? 'Aplicar categorização ao prontuário' : 'Usar no prontuário'}
          </Button>
        )}

        {hasAiResult && (
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-gray-700 underline"
            onClick={() => setUseAi(!useAi)}
          >
            {useAi ? 'Inserir manualmente' : 'Usar categorização IA'}
          </button>
        )}
      </div>
    </div>
  );
}
