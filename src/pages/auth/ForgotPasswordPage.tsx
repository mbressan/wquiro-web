import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'

const requestSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

const confirmSchema = z
  .object({
    token: z.string().min(1, 'Token obrigatório'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    password_confirm: z.string().min(8),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: 'As senhas não coincidem',
    path: ['password_confirm'],
  })

type RequestForm = z.infer<typeof requestSchema>
type ConfirmForm = z.infer<typeof confirmSchema>

export function ForgotPasswordPage() {
  const [requested, setRequested] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token')

  const requestMutation = useMutation({
    mutationFn: async (data: RequestForm) => {
      await api.post('/auth/password-reset/', data)
    },
    onSuccess: () => setRequested(true),
    onError: () => setRequested(true), // Always show the same message
  })

  const confirmMutation = useMutation({
    mutationFn: async (data: ConfirmForm) => {
      await api.post('/auth/password-reset/confirm/', {
        token: data.token,
        new_password: data.password,
      })
    },
    onSuccess: () => navigate('/login'),
  })

  const requestForm = useForm<RequestForm>({ resolver: zodResolver(requestSchema) })
  const confirmForm = useForm<ConfirmForm>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { token: tokenFromUrl ?? '' },
  })

  if (tokenFromUrl || requested) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">QuiroGestão</h1>
          <h2 className="auth-subtitle">Nova senha</h2>

          {requested && !tokenFromUrl && (
            <p className="form-success" role="status">
              Verifique seu e-mail para continuar.
            </p>
          )}

          <form onSubmit={confirmForm.handleSubmit((d) => confirmMutation.mutateAsync(d))} noValidate>
            {!tokenFromUrl && (
              <div className="form-field">
                <label htmlFor="token">Código do e-mail</label>
                <input id="token" type="text" {...confirmForm.register('token')} />
                {confirmForm.formState.errors.token && (
                  <span className="form-error">{confirmForm.formState.errors.token.message}</span>
                )}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="password">Nova senha</label>
              <input id="password" type="password" autoComplete="new-password" {...confirmForm.register('password')} />
              {confirmForm.formState.errors.password && (
                <span className="form-error">{confirmForm.formState.errors.password.message}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="password_confirm">Confirmar senha</label>
              <input id="password_confirm" type="password" autoComplete="new-password" {...confirmForm.register('password_confirm')} />
              {confirmForm.formState.errors.password_confirm && (
                <span className="form-error">{confirmForm.formState.errors.password_confirm.message}</span>
              )}
            </div>

            {confirmMutation.isError && (
              <p className="form-error form-error--global" role="alert">
                Token inválido ou expirado.
              </p>
            )}

            <button type="submit" disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">QuiroGestão</h1>
        <h2 className="auth-subtitle">Recuperar senha</h2>

        <form onSubmit={requestForm.handleSubmit((d) => requestMutation.mutateAsync(d))} noValidate>
          <div className="form-field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" autoComplete="email" {...requestForm.register('email')} />
            {requestForm.formState.errors.email && (
              <span className="form-error">{requestForm.formState.errors.email.message}</span>
            )}
          </div>

          <button type="submit" disabled={requestMutation.isPending}>
            {requestMutation.isPending ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Voltar ao login</Link>
        </p>
      </div>
    </div>
  )
}
