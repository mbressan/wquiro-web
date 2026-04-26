import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'
import { FormField, Input, SubmitButton } from '@/components/auth/FormField'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data)
      navigate('/')
    } catch {
      // handled by mutation state
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Entrar na conta</h2>
        <p className="mt-1 text-sm text-gray-500">Bem-vindo de volta!</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
            autoComplete="current-password"
            placeholder="••••••••"
            error={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
            Esqueci minha senha
          </Link>
        </div>

        {loginMutation.isError && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            E-mail ou senha incorretos.
          </p>
        )}

        <SubmitButton loading={isSubmitting || loginMutation.isPending}>
          Entrar
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-gray-500">
        Não tem conta?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:underline">
          Criar conta grátis
        </Link>
      </p>
    </div>
  )
}
