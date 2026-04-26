import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import type { RegisterResponse } from '@/types/auth'
import { FormField, Input, SubmitButton } from '@/components/auth/FormField'

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Criar conta</h2>
        <p className="mt-1 text-sm text-gray-500">14 dias grátis, sem cartão de crédito.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField id="clinic_name" label="Nome da clínica" error={errors.clinic_name?.message}>
          <Input
            id="clinic_name"
            type="text"
            placeholder="Clínica Vertebral"
            error={!!errors.clinic_name}
            {...register('clinic_name')}
          />
        </FormField>

        <FormField id="name" label="Seu nome" error={errors.name?.message}>
          <Input
            id="name"
            type="text"
            placeholder="Dr. João Silva"
            error={!!errors.name}
            {...register('name')}
          />
        </FormField>

        <FormField id="email" label="E-mail" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            error={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField id="password" label="Senha" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            error={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <FormField id="phone" label="Telefone (opcional)">
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            {...register('phone')}
          />
        </FormField>

        {registerMutation.isError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Erro ao criar conta. Verifique os dados e tente novamente.
          </p>
        )}

        <SubmitButton loading={isSubmitting || registerMutation.isPending}>
          Criar conta grátis
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-gray-500">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
