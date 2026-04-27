import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

export function useAuthBootstrap(): boolean {
  const [isReady, setIsReady] = useState(false)
  const hasBoostrapped = useRef(false) // StrictMode guard — previne double-call em dev

  useEffect(() => {
    if (hasBoostrapped.current) return
    hasBoostrapped.current = true

    const bootstrap = async () => {
      const { accessToken, refreshToken, setTokens, logout } = useAuthStore.getState()

      if (accessToken) {
        setIsReady(true)
        return
      }

      if (!refreshToken) {
        setIsReady(true)
        return
      }

      // Usa axios direto (não instância api) para evitar loop com interceptor 401
      try {
        const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'
        const response = await axios.post(`${baseURL}/auth/refresh/`, {
          refresh: refreshToken,
        })
        const newRefresh: string = response.data.refresh ?? refreshToken
        setTokens(response.data.access, newRefresh)
      } catch {
        logout()
      } finally {
        setIsReady(true)
      }
    }

    bootstrap()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return isReady
}
