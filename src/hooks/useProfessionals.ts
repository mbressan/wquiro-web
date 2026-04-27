import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Professional } from '@/types/appointment';
import type { TimeSlot } from '@/types/appointment';
import type {
  InviteCreate,
  ProfessionalCreate,
  ProfessionalFilters,
  ProfessionalUpdate,
  TeamInvite,
} from '@/types/professional';
import type { Professional as ProfessionalFull } from '@/types/professional';

// ---------------------------------------------------------------------------
// FullCalendar hook — mantido sem alteração para não quebrar a Agenda
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Admin management hooks
// ---------------------------------------------------------------------------

export function useProfessionalsAdmin(filters?: ProfessionalFilters) {
  return useQuery({
    queryKey: ['professionals-admin', filters],
    queryFn: () =>
      api
        .get<{ results: ProfessionalFull[]; count: number }>('/accounts/users/', { params: filters })
        .then((r) => r.data),
  });
}

export function useCreateProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfessionalCreate) =>
      api.post<ProfessionalFull>('/accounts/users/', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals-admin'] });
    },
  });
}

export function useUpdateProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProfessionalUpdate }) =>
      api.patch<ProfessionalFull>(`/accounts/users/${id}/`, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['professionals-admin'] });
      queryClient.invalidateQueries({ queryKey: ['professionals-admin', id] });
    },
  });
}

export function useDeactivateProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/users/${id}/`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals-admin'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Invite hooks
// ---------------------------------------------------------------------------

export function useInvites() {
  return useQuery({
    queryKey: ['invites'],
    queryFn: () =>
      api
        .get<{ results: TeamInvite[]; count: number }>('/accounts/invites/')
        .then((r) => r.data),
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteCreate) =>
      api.post<TeamInvite>('/accounts/invites/', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
    },
  });
}

export function useResendInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<TeamInvite>(`/accounts/invites/${id}/resend/`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
    },
  });
}

export function useCancelInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<TeamInvite>(`/accounts/invites/${id}/cancel/`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
    },
  });
}
