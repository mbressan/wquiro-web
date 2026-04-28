import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { navigateTo } from '@/lib/navigation'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.warn('[api] VITE_API_URL não definido — usando fallback localhost. Configure a variável em produção.')
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: add Authorization header
api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) {
        useAuthStore.getState().logout()
        navigateTo('/login')
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh: refreshToken },
        )

        const newAccessToken: string = response.data.access
        const newRefreshToken: string = response.data.refresh ?? refreshToken
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        navigateTo('/login')
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export default api
