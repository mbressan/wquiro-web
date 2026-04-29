import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  TranscriptionPollResponse,
  ApplyTranscriptionPayload,
  ApplyTranscriptionResponse,
} from '@/types/recording';

const POLL_INTERVAL_MS = 5000;
const TIMEOUT_MINUTES = 10;

function isActive(status: string) {
  return status === 'pending' || status === 'processing';
}

export function useTranscription(recordingId: string | null) {
  return useQuery({
    queryKey: ['recording', recordingId, 'transcription'],
    queryFn: async () => {
      const { data } = await api.get<TranscriptionPollResponse>(
        `/prontuario/recordings/${recordingId}/transcription/`,
      );
      return data;
    },
    enabled: !!recordingId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return POLL_INTERVAL_MS;
      return isActive(data.transcription_status) ? POLL_INTERVAL_MS : false;
    },
    select: (data) => {
      const createdAt = new Date(data.created_at).getTime();
      const isDelayed =
        isActive(data.transcription_status) &&
        Date.now() - createdAt > TIMEOUT_MINUTES * 60 * 1000;
      return { ...data, isDelayed };
    },
  });
}

export function useCategorize(recordingId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(
        `/prontuario/recordings/${recordingId}/categorize/`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recording', recordingId, 'transcription'] });
    },
  });
}

export function useApplyTranscription(recordingId: string | null, clinicalRecordId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ApplyTranscriptionPayload) => {
      const { data } = await api.post<ApplyTranscriptionResponse>(
        `/prontuario/recordings/${recordingId}/apply/`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinical-record', clinicalRecordId] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
}
