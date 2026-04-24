import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Clinic } from '@/types/auth'
import type { SubscriptionCurrent } from '@/types/subscription'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  clinic: Clinic | null
  subscription: SubscriptionCurrent | null
  setTokens: (access: string, refresh: string) => void
  setUser: (user: User, clinic: Clinic, subscription?: SubscriptionCurrent | null) => void
  setSubscription: (subscription: SubscriptionCurrent | null) => void
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
      // Only persist refresh token - access token stays in memory only
      partialize: (state) => ({ refreshToken: state.refreshToken }),
    },
  ),
)
