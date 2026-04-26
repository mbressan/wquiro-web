import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import { FormField, Input, SubmitButton } from '@/components/auth/FormField'

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
    onError: () => setRequested(true),
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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Nova senha</h2>
        </div>

        {requested && !tokenFromUrl && (
          <div className="flex items-start gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Verifique seu e-mail e insira o código abaixo.</span>
          </div>
        )}

        <form
          onSubmit={confirmForm.handleSubmit((d) => confirmMutation.mutateAsync(d))}
          noValidate
          className="space-y-4"
        >
          {!tokenFromUrl && (
            <FormField id="token" label="Código do e-mail" error={confirmForm.formState.errors.token?.message}>
              <Input
                id="token"
                type="text"
                placeholder="Cole o código aqui"
                error={!!confirmForm.formState.errors.token}
                {...confirmForm.register('token')}
              />
            </FormField>
          )}

          <FormField id="password" label="Nova senha" error={confirmForm.formState.errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              error={!!confirmForm.formState.errors.password}
              {...confirmForm.register('password')}
            />
          </FormField>

          <FormField id="password_confirm" label="Confirmar senha" error={confirmForm.formState.errors.password_confirm?.message}>
            <Input
              id="password_confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repita a nova senha"
              error={!!confirmForm.formState.errors.password_confirm}
              {...confirmForm.register('password_confirm')}
            />
          </FormField>

          {confirmMutation.isError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              Token inválido ou expirado.
            </p>
          )}

          <SubmitButton loading={confirmMutation.isPending}>
            Salvar nova senha
          </SubmitButton>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Recuperar senha</h2>
        <p className="mt-1 text-sm text-gray-500">
          Enviaremos um link de recuperação para seu e-mail.
        </p>
      </div>

      <form
        onSubmit={requestForm.handleSubmit((d) => requestMutation.mutateAsync(d))}
        noValidate
        className="space-y-4"
      >
        <FormField id="email" label="E-mail" error={requestForm.formState.errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            error={!!requestForm.formState.errors.email}
            {...requestForm.register('email')}
          />
        </FormField>

        <SubmitButton loading={requestMutation.isPending}>
          Enviar link de recuperação
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-gray-500">
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          ← Voltar ao login
        </Link>
      </p>
    </div>
  )
}
