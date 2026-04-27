import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { PosturalHistoricoItem } from '@/types/posture'

export function usePosturalHistorico(patientId: string) {
  return useQuery({
    queryKey: ['postural-historico', patientId],
    queryFn: async () => {
      const { data } = await api.get('/prontuario/evolucao-postural/', {
        params: { paciente: patientId },
      })
      return data as PosturalHistoricoItem[]
    },
    enabled: !!patientId,
  })
}
