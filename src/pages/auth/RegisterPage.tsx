import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import type { RegisterResponse } from '@/types/auth'

const registerSchema = z.object({
  clinic_name: z.string().min(2, 'Nome da clínica deve ter pelo menos 2 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  phone: z.string().optional(),
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await api.post<RegisterResponse>('/subscriptions/register/', data)
      return response.data
    },
    onSuccess: (data) => {
      setTokens(data.access, data.refresh)
      setUser(data.user, data.clinic)
      navigate('/')
    },
  })

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync(data)
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { email?: string[] } } }
      if (apiError?.response?.data?.email) {
        setError('email', { message: apiError.response.data.email[0] })
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">QuiroGestão</h1>
        <h2 className="auth-subtitle">Criar conta</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-field">
            <label htmlFor="clinic_name">Nome da clínica</label>
            <input id="clinic_name" type="text" {...register('clinic_name')} />
            {errors.clinic_name && (
              <span className="form-error">{errors.clinic_name.message}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="name">Seu nome</label>
            <input id="name" type="text" {...register('name')} />
            {errors.name && (
              <span className="form-error">{errors.name.message}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password">Senha</label>
            <input id="password" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="phone">Telefone (opcional)</label>
            <input id="phone" type="tel" {...register('phone')} />
          </div>

          <button type="submit" disabled={isSubmitting || registerMutation.isPending}>
            {registerMutation.isPending ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
