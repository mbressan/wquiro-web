import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Plan, SubscriptionCurrent } from '@/types/subscription'
import { useAuthStore } from '@/stores/authStore'

export function useSubscriptionCurrent() {
  const accessToken = useAuthStore((s) => s.accessToken)

  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: async () => {
      const response = await api.get<SubscriptionCurrent>('/subscriptions/current/')
      return response.data
    },
    enabled: !!accessToken,
  })
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await api.get<Plan[]>('/subscriptions/plans/')
      return response.data
    },
  })
}
