import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import type { LoginResponse, MeResponse } from '@/types/auth'

export function useLogin() {
  const { setTokens, setUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post<LoginResponse>('/auth/login/', credentials)
      return response.data
    },
    onSuccess: (data) => {
      setTokens(data.access, data.refresh)
      setUser(data.user, data.clinic)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken })
      }
    },
    onSuccess: () => {
      logout()
      queryClient.clear()
    },
    onError: () => {
      // Logout locally even if the request fails
      logout()
      queryClient.clear()
    },
  })
}

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const { setUser } = useAuthStore()

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get<MeResponse>('/auth/me/')
      return response.data
    },
    enabled: !!accessToken,
    onSuccess: (data: MeResponse) => {
      if (data.user && data.clinic) {
        setUser(data.user, data.clinic)
      }
    },
  } as Parameters<typeof useQuery>[0])
}
