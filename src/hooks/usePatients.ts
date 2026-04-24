import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  PaginatedPatients,
  PatientCreate,
  PatientDetail,
  PatientFilters,
  PatientTagWithCount,
} from '@/types/patient';

export const PATIENTS_KEY = 'patients';

export function usePatients(filters: PatientFilters = {}) {
  const limitWarningRef = useRef(false);

  const query = useQuery({
    queryKey: [PATIENTS_KEY, filters],
    queryFn: async () => {
      const res = await api.get<PaginatedPatients>('/pacientes/', { params: filters });
      limitWarningRef.current = res.headers['x-limit-warning'] === 'patients';
      return res.data;
    },
  });

  return { ...query, limitWarning: limitWarningRef.current };
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: [PATIENTS_KEY, id],
    queryFn: () => api.get<PatientDetail>(`/pacientes/${id}/`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PatientCreate) =>
      api.post<PatientDetail>('/pacientes/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PATIENTS_KEY] });
    },
  });
}

export function useUpdatePatient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PatientCreate>) =>
      api.patch<PatientDetail>(`/pacientes/${id}/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PATIENTS_KEY] });
    },
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/pacientes/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PATIENTS_KEY] });
    },
  });
}

export function usePatientTags() {
  return useQuery({
    queryKey: [PATIENTS_KEY, 'tags'],
    queryFn: () => api.get<PatientTagWithCount[]>('/pacientes/tags/').then((r) => r.data),
  });
}
