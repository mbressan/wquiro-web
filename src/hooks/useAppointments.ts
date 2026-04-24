import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  Appointment,
  AppointmentCreate,
  PaginatedAppointments,
  SessionPackage,
} from '@/types/appointment';

export const APPOINTMENTS_KEY = 'appointments';

interface AppointmentFilters {
  professional?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  month?: string;
  status?: string;
  patient?: string;
}

export function useAppointments(filters: AppointmentFilters = {}) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, filters],
    queryFn: () =>
      api.get<PaginatedAppointments>('/consultas/', { params: filters }).then((r) => r.data),
  });
}

export function useMyAppointments(filters: AppointmentFilters = {}) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, 'me', filters],
    queryFn: () =>
      api.get<PaginatedAppointments>('/consultas/me/', { params: filters }).then((r) => r.data),
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AppointmentCreate) =>
      api.post<Appointment>('/consultas/', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}

export function useUpdateAppointment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AppointmentCreate> & { status?: string }) =>
      api.patch<Appointment>(`/consultas/${id}/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}

export function useCheckin(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<Appointment>(`/consultas/${id}/checkin/`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}

export function useGeneratePaymentLink(id: string) {
  return useMutation({
    mutationFn: () =>
      api.post<{ payment_id: string }>(`/consultas/${id}/payment-link/`).then((r) => r.data),
  });
}

export function useSessionPackages(patientId?: string) {
  return useQuery({
    queryKey: ['session-packages', patientId],
    queryFn: () =>
      api
        .get<SessionPackage[]>('/agenda/pacotes/', { params: patientId ? { patient: patientId } : {} })
        .then((r) => r.data),
    enabled: !!patientId,
  });
}
