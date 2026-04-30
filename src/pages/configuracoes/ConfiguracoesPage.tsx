import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionCurrent } from '@/hooks/useSubscription';
import { useLogout } from '@/hooks/useAuth';
import {
  useUpdatePerfil,
  useChangePassword,
  useUpdateClinica,
  type UpdatePerfilPayload,
  type ChangePasswordPayload,
  type UpdateClinicaPayload,
} from '@/hooks/useMePerfil';
import { PageContainer, PageHeader, Button, SkeletonText, Input, Textarea, Modal } from '@/components/ui';
import { Building2, User, CreditCard, LogOut, MessageCircle, ChevronRight, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PROFESSIONAL_COLOR_PALETTE } from '@/lib/constants';

function UsageBar({ current, limit, label }: { current: number; limit: number; label: string }) {
  const pct = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const warn = pct >= 80;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span>
          {current} / {limit === -1 ? '∞' : limit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={['h-full rounded-full transition-all', warn ? 'bg-amber-500' : 'bg-primary-600'].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div className="py-2.5 flex items-center justify-between border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  trialing: 'Trial',
  active: 'Ativo',
  past_due: 'Pagamento em atraso',
  expired: 'Expirado',
  canceled: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  trialing: 'bg-amber-100 text-amber-700',
  active: 'bg-emerald-100 text-emerald-700',
  past_due: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600',
  canceled: 'bg-gray-100 text-gray-600',
};

// ─── Perfil Section ──────────────────────────────────────────────────────────

function PerfilSection({ onOpenChangePassword }: { onOpenChangePassword: () => void }) {
  const user = useAuthStore((s) => s.user);
  const [isEditing, setIsEditing] = useState(false);
  const updatePerfil = useUpdatePerfil();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<UpdatePerfilPayload>({
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      color: user?.color ?? '',
      notes: user?.notes ?? '',
    },
  });

  const selectedColor = watch('color');

  function handleEdit() {
    reset({
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      color: user?.color ?? '',
      notes: user?.notes ?? '',
    });
    setIsEditing(true);
  }

  async function onSubmit(data: UpdatePerfilPayload) {
    await updatePerfil.mutateAsync(data);
    setIsEditing(false);
  }

  const roleLabel =
    user?.role === 'admin'
      ? 'Administrador'
      : user?.role === 'professional'
        ? 'Profissional'
        : 'Recepcionista';

  return (
    <Section
      title="Meu Perfil"
      icon={User}
      action={
        !isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            <Pencil className="h-3 w-3" />
            Editar
          </button>
        ) : undefined
      }
    >
      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
            <Input {...register('name', { required: 'Nome obrigatório' })} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
            <Input {...register('phone')} placeholder="(11) 99999-9999" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cor de identificação</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {PROFESSIONAL_COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={[
                    'h-7 w-7 rounded-full border-2 transition-all',
                    selectedColor === color
                      ? 'border-gray-900 scale-110'
                      : 'border-transparent hover:scale-105',
                  ].join(' ')}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notas internas</label>
            <Textarea {...register('notes')} rows={3} placeholder="Informações adicionais..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={updatePerfil.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      ) : (
        <>
          <Field label="Nome" value={user?.name} />
          <Field label="E-mail" value={user?.email} />
          <Field label="Telefone" value={user?.phone} />
          <Field label="Papel" value={roleLabel} />
          {user?.color && (
            <div className="py-2.5 flex items-center justify-between border-b border-gray-50">
              <span className="text-sm text-gray-500">Cor</span>
              <span
                className="h-5 w-5 rounded-full border border-gray-200"
                style={{ backgroundColor: user.color }}
              />
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={onOpenChangePassword}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Alterar senha
            </button>
          </div>
        </>
      )}
    </Section>
  );
}

// ─── Clínica Section ─────────────────────────────────────────────────────────

function ClinicaSection() {
  const user = useAuthStore((s) => s.user);
  const clinic = useAuthStore((s) => s.clinic);
  const isAdmin = user?.role === 'admin';
  const [isEditing, setIsEditing] = useState(false);
  const updateClinica = useUpdateClinica();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateClinicaPayload>({
    defaultValues: {
      name: clinic?.name ?? '',
      email: clinic?.email ?? '',
      phone: clinic?.phone ?? '',
      address: clinic?.address ?? '',
      booking_fee_enabled: clinic?.booking_fee_enabled ?? false,
      booking_fee_amount: clinic?.booking_fee_amount ?? '',
      booking_fee_deadline_hours: clinic?.booking_fee_deadline_hours ?? 24,
    },
  });

  function handleEdit() {
    reset({
      name: clinic?.name ?? '',
      email: clinic?.email ?? '',
      phone: clinic?.phone ?? '',
      address: clinic?.address ?? '',
      booking_fee_enabled: clinic?.booking_fee_enabled ?? false,
      booking_fee_amount: clinic?.booking_fee_amount ?? '',
      booking_fee_deadline_hours: clinic?.booking_fee_deadline_hours ?? 24,
    });
    setIsEditing(true);
  }

  async function onSubmit(data: UpdateClinicaPayload) {
    await updateClinica.mutateAsync(data);
    setIsEditing(false);
  }

  return (
    <Section
      title="Clínica"
      icon={Building2}
      action={
        isAdmin && !isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            <Pencil className="h-3 w-3" />
            Editar
          </button>
        ) : undefined
      }
    >
      {isEditing && isAdmin ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome da clínica</label>
            <Input {...register('name', { required: 'Nome obrigatório' })} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
            <Input {...register('email')} type="email" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
            <Input {...register('phone')} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Endereço</label>
            <Input {...register('address')} />
          </div>

          <div className="rounded-lg border border-gray-100 p-3 space-y-3">
            <p className="text-xs font-medium text-gray-600">Taxa de agendamento</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('booking_fee_enabled')} className="rounded" />
              Habilitar taxa para novos pacientes
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Valor (R$)</label>
                <Input {...register('booking_fee_amount')} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Prazo (horas)</label>
                <Input {...register('booking_fee_deadline_hours')} type="number" min={1} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={updateClinica.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      ) : (
        <>
          <Field label="Nome" value={clinic?.name} />
          <Field label="Slug" value={clinic?.slug} />
          <Field label="E-mail" value={clinic?.email} />
          <Field label="Telefone" value={clinic?.phone} />
          <Field label="Endereço" value={clinic?.address} />
        </>
      )}
    </Section>
  );
}

// ─── Alterar Senha Modal ──────────────────────────────────────────────────────

interface ChangePasswordFormData extends ChangePasswordPayload {
  confirm_new_password: string;
}

function AlterarSenhaModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const logout = useLogout();
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch('new_password');

  async function onSubmit(data: ChangePasswordFormData) {
    await changePassword.mutateAsync({
      current_password: data.current_password,
      new_password: data.new_password,
    });
    logout.mutate(undefined, {
      onSuccess: () => navigate('/login'),
      onError: () => navigate('/login'),
    });
  }

  return (
    <Modal
      title="Alterar Senha"
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="change-password-form"
            size="sm"
            loading={changePassword.isPending || logout.isPending}
          >
            Alterar senha
          </Button>
        </div>
      }
    >
      <form id="change-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Senha atual</label>
          <Input
            {...register('current_password', { required: 'Senha atual obrigatória' })}
            type="password"
            autoComplete="current-password"
          />
          {errors.current_password && (
            <p className="text-xs text-red-500 mt-1">{errors.current_password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nova senha</label>
          <Input
            {...register('new_password', {
              required: 'Nova senha obrigatória',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            })}
            type="password"
            autoComplete="new-password"
          />
          {errors.new_password && (
            <p className="text-xs text-red-500 mt-1">{errors.new_password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Confirmar nova senha</label>
          <Input
            {...register('confirm_new_password', {
              required: 'Confirmação obrigatória',
              validate: (v) => v === newPassword || 'As senhas não coincidem',
            })}
            type="password"
            autoComplete="new-password"
          />
          {errors.confirm_new_password && (
            <p className="text-xs text-red-500 mt-1">{errors.confirm_new_password.message}</p>
          )}
        </div>

        {changePassword.error && (
          <p className="text-xs text-red-500">
            {(changePassword.error as { response?: { data?: { current_password?: string[] } } })?.response?.data
              ?.current_password?.[0] ?? 'Erro ao alterar senha. Tente novamente.'}
          </p>
        )}
      </form>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: sub } = useSubscriptionCurrent();
  const [showChangePassword, setShowChangePassword] = useState(false);

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  }

  return (
    <PageContainer size="md">
      <PageHeader title="Configurações" subtitle="Dados da conta e assinatura" />

      {/* Clínica */}
      <ClinicaSection />

      {/* Perfil */}
      <PerfilSection onOpenChangePassword={() => setShowChangePassword(true)} />

      {/* Assinatura */}
      <Section title="Assinatura" icon={CreditCard}>
        {sub ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{sub.plan.name}</p>
                <p className="text-xs text-gray-500">R$ {sub.plan.price_monthly}/mês</p>
              </div>
              <span
                className={[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  STATUS_COLOR[sub.status] ?? 'bg-gray-100 text-gray-600',
                ].join(' ')}
              >
                {STATUS_LABEL[sub.status] ?? sub.status}
              </span>
            </div>

            {sub.status === 'trialing' && sub.trial_days_remaining > 0 && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Trial termina em <strong>{sub.trial_days_remaining} dias</strong>.
              </p>
            )}

            {sub.current_period_end && (
              <p className="text-xs text-gray-500">
                Próxima renovação:{' '}
                {new Date(sub.current_period_end).toLocaleDateString('pt-BR')}
              </p>
            )}

            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Uso</p>
              <UsageBar
                label="Profissionais"
                current={sub.usage.professionals.current}
                limit={sub.usage.professionals.limit}
              />
              <UsageBar
                label="Pacientes"
                current={sub.usage.patients.current}
                limit={sub.usage.patients.limit}
              />
            </div>
          </div>
        ) : (
          <SkeletonText lines={3} />
        )}
      </Section>

      {/* WhatsApp */}
      <Section title="WhatsApp" icon={MessageCircle}>
        <button
          onClick={() => navigate('/configuracoes/whatsapp')}
          className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-left transition-colors hover:bg-gray-50"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">Configurar integração WhatsApp</p>
            <p className="text-xs text-gray-500">Conecte sua instância Evolution API e gerencie notificações</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
        </button>
      </Section>

      {/* Ações */}
      <div className="flex justify-end">
        <Button variant="destructive" onClick={handleLogout} loading={logout.isPending}>
          <LogOut className="h-4 w-4" />
          Sair da conta
        </Button>
      </div>

      {/* Modal Alterar Senha */}
      {showChangePassword && <AlterarSenhaModal onClose={() => setShowChangePassword(false)} />}
    </PageContainer>
  );
}
