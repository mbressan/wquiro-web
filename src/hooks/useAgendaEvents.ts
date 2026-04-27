import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  AgendaEvent,
  AgendaEventCreate,
  AgendaEventUpdate,
  EventScope,
} from '@/types/agenda';

export const EVENTS_KEY = 'agenda-events';

interface EventFilters {
  professional?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  event_type?: string;
}

export function useAgendaEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: [EVENTS_KEY, filters],
    queryFn: () =>
      api.get<AgendaEvent[]>('/agenda/eventos/', { params: filters }).then((r) => r.data),
  });
}

export function useCreateAgendaEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AgendaEventCreate) =>
      api.post<AgendaEvent>('/agenda/eventos/', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });
}

export function useUpdateAgendaEvent(scope: EventScope = 'single') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AgendaEventUpdate }) =>
      api
        .patch<AgendaEvent>(`/agenda/eventos/${id}/`, data, { params: { scope } })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });
}

export function useDeleteAgendaEvent(scope: EventScope = 'single') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/agenda/eventos/${id}/`, { params: { scope } }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  });
}
