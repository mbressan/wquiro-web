import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  PaginatedWhatsAppMessages,
  ClinicWhatsAppConfig,
  SendWhatsAppPayload,
  WhatsAppMessageFilters,
  ClinicWhatsAppConfigUpdate,
} from '@/types/whatsapp';

export const WHATSAPP_MESSAGES_KEY = 'whatsapp-messages';
export const WHATSAPP_CONFIG_KEY = 'whatsapp-config';

export function usePatientMessages(patientId: string, filters?: WhatsAppMessageFilters) {
  return useQuery<PaginatedWhatsAppMessages>({
    queryKey: [WHATSAPP_MESSAGES_KEY, patientId, filters],
    queryFn: () =>
      api
        .get('/comunicacao/messages/', { params: { patient: patientId, ...filters } })
        .then((r) => r.data),
    enabled: Boolean(patientId),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SendWhatsAppPayload) =>
      api.post('/comunicacao/messages/send/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WHATSAPP_MESSAGES_KEY] }),
  });
}

export function useWhatsAppConfig() {
  return useQuery<ClinicWhatsAppConfig>({
    queryKey: [WHATSAPP_CONFIG_KEY],
    queryFn: () => api.get('/comunicacao/config/').then((r) => r.data),
  });
}

export function useUpdateWhatsAppConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClinicWhatsAppConfigUpdate) =>
      api.patch('/comunicacao/config/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WHATSAPP_CONFIG_KEY] }),
  });
}
