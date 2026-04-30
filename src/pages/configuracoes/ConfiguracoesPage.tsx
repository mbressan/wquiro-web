import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionCurrent } from '@/hooks/useSubscription';
import { useLogout } from '@/hooks/useAuth';
import { PageContainer, PageHeader, Button, SkeletonText } from '@/components/ui';
import { Building2, User, CreditCard, LogOut, MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <Icon className="h-4 w-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
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

export default function ConfiguracoesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clinic = useAuthStore((s) => s.clinic);
  const logout = useLogout();
  const { data: sub } = useSubscriptionCurrent();

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    });
  }

  return (
    <PageContainer size="md">
      <PageHeader title="Configurações" subtitle="Dados da conta e assinatura" />

      {/* Clínica */}
      <Section title="Clínica" icon={Building2}>
        <Field label="Nome" value={clinic?.name} />
        <Field label="Slug" value={clinic?.slug} />
        <Field label="E-mail" value={clinic?.email} />
      </Section>

      {/* Perfil */}
      <Section title="Meu Perfil" icon={User}>
        <Field label="Nome" value={user?.name} />
        <Field label="E-mail" value={user?.email} />
        <Field label="Telefone" value={user?.phone} />
        <Field
          label="Papel"
          value={user?.role === 'admin' ? 'Administrador' : user?.role === 'professional' ? 'Profissional' : 'Recepcionista'}
        />
      </Section>

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
    </PageContainer>
  );
}
