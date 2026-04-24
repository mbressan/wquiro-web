import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Professional, TimeSlot } from '@/types/appointment';

export function useProfessionals() {
  return useQuery({
    queryKey: ['professionals'],
    queryFn: () => api.get<Professional[]>('/agenda/profissionais/').then((r) => r.data),
  });
}

export function useSlots(professionalId: string, date: string) {
  return useQuery({
    queryKey: ['slots', professionalId, date],
    queryFn: () =>
      api
        .get<TimeSlot[]>('/agenda/slots/', { params: { professional: professionalId, date } })
        .then((r) => r.data),
    enabled: !!(professionalId && date),
  });
}
