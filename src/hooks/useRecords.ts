import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ClinicalRecord, ClinicalRecordListItem, ClinicalRecordUpdate, SpineHistoryItem } from '@/types/record';

export const RECORDS_KEY = 'clinical-records';

export function useRecord(id: string | undefined) {
  return useQuery<ClinicalRecord>({
    queryKey: [RECORDS_KEY, id],
    queryFn: () => api.get(`/prontuario/registros/${id}/`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useAppointmentRecord(appointmentId: string | undefined) {
  return useQuery<ClinicalRecord>({
    queryKey: [RECORDS_KEY, 'appointment', appointmentId],
    queryFn: () =>
      api.get(`/prontuario/registros/`, { params: { appointment: appointmentId } }).then((r) => {
        const results = r.data.results ?? r.data;
        return results[0] ?? null;
      }),
    enabled: !!appointmentId,
  });
}

export function usePatientRecords(patientId: string | undefined) {
  return useQuery<ClinicalRecordListItem[]>({
    queryKey: [RECORDS_KEY, 'patient', patientId],
    queryFn: () =>
      api.get(`/prontuario/registros/`, { params: { patient: patientId } }).then((r) => r.data.results ?? r.data),
    enabled: !!patientId,
  });
}

export function useUpdateRecord(id: string) {
  const qc = useQueryClient();
  return useMutation<ClinicalRecord, unknown, ClinicalRecordUpdate>({
    mutationFn: (data) => api.patch(`/prontuario/registros/${id}/`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RECORDS_KEY] });
    },
  });
}

export function useSpineHistory(patientId: string | undefined) {
  return useQuery<SpineHistoryItem[]>({
    queryKey: [RECORDS_KEY, 'spine', patientId],
    queryFn: () =>
      api.get(`/prontuario/coluna/`, { params: { paciente: patientId } }).then((r) => r.data),
    enabled: !!patientId,
  });
}

export function useUploadExam(recordId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post(`/prontuario/registros/${recordId}/exames/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RECORDS_KEY, recordId] });
    },
  });
}
