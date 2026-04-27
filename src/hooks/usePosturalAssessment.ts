import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { PosturalAssessment } from '@/types/posture'

export function usePosturalAssessment(clinicalRecordId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (assessment: PosturalAssessment) => {
      const { data } = await api.patch(`/prontuario/registros/${clinicalRecordId}/`, {
        clinical_data: { posture_assessment: assessment },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinical-records'] })
    },
  })

  return {
    save: (assessment: PosturalAssessment) => mutation.mutateAsync(assessment),
    isSaving: mutation.isPending,
    error: mutation.error,
  }
}
