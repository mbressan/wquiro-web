import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Specialty, SpecialtyCreate, SpecialtyUpdate, SpecialtyRef } from '@/types/professional';

export const SPECIALTIES_KEY = 'specialties';

export function useSpecialties() {
  return useQuery({
    queryKey: [SPECIALTIES_KEY],
    queryFn: () =>
      api.get<Specialty[] | { results: Specialty[] }>('/accounts/specialties/').then((r) => {
        const data = r.data;
        return Array.isArray(data) ? data : (data as { results: Specialty[] }).results ?? [];
      }),
  });
}

export function useCreateSpecialty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SpecialtyCreate) =>
      api.post<Specialty>('/accounts/specialties/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SPECIALTIES_KEY] });
    },
  });
}

export function useUpdateSpecialty(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SpecialtyUpdate) =>
      api.patch<Specialty>(`/accounts/specialties/${id}/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SPECIALTIES_KEY] });
    },
  });
}

export function useDeactivateSpecialty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/specialties/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SPECIALTIES_KEY] });
    },
  });
}

export function useSetProfessionalSpecialties() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, specialtyIds }: { userId: string; specialtyIds: string[] }) =>
      api
        .put<SpecialtyRef[]>(`/accounts/users/${userId}/specialties/`, {
          specialty_ids: specialtyIds,
        })
        .then((r) => r.data),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['professionals'] });
      qc.invalidateQueries({ queryKey: ['professionals', userId] });
    },
  });
}
