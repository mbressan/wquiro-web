import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  HomeKPIs,
  OperacionalData,
  OperacionalPorProfissionalData,
  FinanceiroData,
  RetencaoData,
  ExportRequest,
  TaskStatus,
} from '@/types/relatorios'

const STALE_TIME = 5 * 60 * 1000

export function useHomeKPIs() {
  return useQuery<HomeKPIs & { isStale?: boolean }>({
    queryKey: ['relatorios', 'home-kpis'],
    queryFn: async () => {
      const resp = await api.get('/relatorios/home-kpis/')
      const data = resp.data
      if (resp.headers['x-cache'] === 'STALE') {
        data.isStale = true
      }
      return data
    },
    staleTime: STALE_TIME,
  })
}

export function useOperacional(period: string, date: string) {
  return useQuery<OperacionalData>({
    queryKey: ['relatorios', 'operacional', period, date],
    queryFn: () =>
      api.get('/relatorios/operacional/', { params: { period, date } }).then((r) => r.data),
    staleTime: STALE_TIME,
    enabled: !!date,
  })
}

export function useOperacionalPorProfissional(period: string, date: string) {
  return useQuery<OperacionalPorProfissionalData>({
    queryKey: ['relatorios', 'operacional-prof', period, date],
    queryFn: () =>
      api
        .get('/relatorios/operacional/por-profissional/', { params: { period, date } })
        .then((r) => r.data),
    staleTime: STALE_TIME,
    enabled: !!date,
  })
}

export function useFinanceiro(period: string, date: string) {
  return useQuery<FinanceiroData>({
    queryKey: ['relatorios', 'financeiro', period, date],
    queryFn: () =>
      api.get('/relatorios/financeiro/', { params: { period, date } }).then((r) => r.data),
    staleTime: STALE_TIME,
    enabled: !!date,
  })
}

export function useRetencao(period: string, date: string) {
  return useQuery<RetencaoData>({
    queryKey: ['relatorios', 'retencao', period, date],
    queryFn: () =>
      api.get('/relatorios/retencao/', { params: { period, date } }).then((r) => r.data),
    staleTime: STALE_TIME,
    enabled: !!date,
  })
}

export function useExportReport() {
  return useMutation<{ task_id: string }, unknown, ExportRequest>({
    mutationFn: (data) => api.post('/relatorios/export/', data).then((r) => r.data),
  })
}

export function useTaskStatus(taskId: string | null) {
  return useQuery<TaskStatus>({
    queryKey: ['relatorios', 'task', taskId],
    queryFn: () => api.get(`/relatorios/tasks/${taskId}/`).then((r) => r.data),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 3000
      if (data.status === 'processing' || data.status === 'pending') return 3000
      return false
    },
  })
}
