import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import type { User, Clinic } from '@/types/auth'

export interface UpdatePerfilPayload {
  name?: string
  phone?: string
  color?: string
  notes?: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

export interface UpdateSpecialtiesPayload {
  specialty_ids: string[]
}

export interface UpdateClinicaPayload {
  name?: string
  email?: string
  phone?: string
  address?: string
  booking_fee_enabled?: boolean
  booking_fee_amount?: string
  booking_fee_deadline_hours?: number
}

export function useUpdatePerfil() {
  const setUser = useAuthStore((s) => s.setUser)
  const clinic = useAuthStore((s) => s.clinic)
  const subscription = useAuthStore((s) => s.subscription)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePerfilPayload) =>
      api.patch<User>('/accounts/me/', data).then((r) => r.data),
    onSuccess: (updated) => {
      if (clinic) setUser(updated, clinic, subscription)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) =>
      api.post('/accounts/me/change-password/', data).then((r) => r.data),
  })
}

export function useUpdateEspecialidades() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSpecialtiesPayload) =>
      api.put('/accounts/me/specialties/', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useUpdateClinica() {
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)
  const subscription = useAuthStore((s) => s.subscription)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateClinicaPayload) =>
      api.patch<Clinic>('/tenants/clinic/', data).then((r) => r.data),
    onSuccess: (updatedClinic) => {
      if (user) setUser(user, updatedClinic, subscription)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}
