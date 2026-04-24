import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'

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
      // Error handled by mutation state
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">QuiroGestão</h1>
        <h2 className="auth-subtitle">Entrar na conta</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}
          </div>

          {loginMutation.isError && (
            <p className="form-error form-error--global" role="alert">
              Credenciais inválidas.
            </p>
          )}

          <button type="submit" disabled={isSubmitting || loginMutation.isPending}>
            {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/forgot-password">Esqueci minha senha</Link>
          {' · '}
          <Link to="/register">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
