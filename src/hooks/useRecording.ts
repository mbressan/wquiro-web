import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import type { RecordingState, ConsultationRecording } from '@/types/recording';

const SUPPORTED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

function getSupportedMimeType(): string | null {
  for (const type of SUPPORTED_MIME_TYPES) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return null;
}

interface UseRecordingOptions {
  clinicalRecordId: string;
  onUploaded?: (recording: ConsultationRecording) => void;
}

export function useRecording({ clinicalRecordId, onUploaded }: UseRecordingOptions) {
  const [state, setState] = useState<RecordingState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported = typeof MediaRecorder !== 'undefined' && getSupportedMimeType() !== null;

  // Alerta ao sair da página durante gravação
  useEffect(() => {
    if (state !== 'recording') return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Gravação em andamento. Sair perderá o áudio.';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async ({ blob, durationSeconds }: { blob: Blob; durationSeconds: number }) => {
      const form = new FormData();
      form.append('audio_file', blob, `recording-${Date.now()}.webm`);
      form.append('duration_seconds', String(durationSeconds));
      const { data } = await api.post<ConsultationRecording>(
        `/prontuario/registros/${clinicalRecordId}/recordings/`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data;
    },
    onSuccess: (data) => {
      setState('done');
      onUploaded?.(data);
    },
    onError: () => {
      setState('error');
      setError('Falha ao enviar gravação. Tente novamente.');
    },
  });

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Use Chrome 90+ ou Firefox 90+ para gravação.');
      setState('error');
      return;
    }

    setState('requesting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType()!;
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        streamRef.current?.getTracks().forEach(t => t.stop());
        setState('uploading');
        uploadMutation.mutate({ blob, durationSeconds: elapsed });
      };

      recorder.start(250); // chunks a cada 250ms
      startTimeRef.current = Date.now();
      setState('recording');

      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('Permissão de microfone negada. Habilite nas configurações do navegador.');
      } else {
        setError('Não foi possível acessar o microfone.');
      }
      setState('error');
    }
  }, [clinicalRecordId, isSupported, uploadMutation]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setElapsedSeconds(0);
  }, []);

  return {
    state,
    elapsedSeconds,
    error,
    isSupported,
    startRecording,
    stopRecording,
    reset,
  };
}
