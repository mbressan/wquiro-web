import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Clinic, AuthSubscription } from '@/types/auth'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  clinic: Clinic | null
  subscription: AuthSubscription | null
  setTokens: (access: string, refresh: string) => void
  setUser: (user: User, clinic: Clinic, subscription?: AuthSubscription | null) => void
  setSubscription: (subscription: AuthSubscription | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      clinic: null,
      subscription: null,

      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),

      setUser: (user, clinic, subscription = null) =>
        set({ user, clinic, subscription }),

      setSubscription: (subscription) => set({ subscription }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          clinic: null,
          subscription: null,
        }),
    }),
    {
      name: 'wquiro-auth',
      storage: createJSONStorage(() => localStorage),
      // accessToken stays in memory only (XSS protection)
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
        clinic: state.clinic,
        subscription: state.subscription,
      }),
    },
  ),
)
