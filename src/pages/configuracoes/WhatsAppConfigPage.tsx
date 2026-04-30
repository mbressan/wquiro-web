import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MessageCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useWhatsAppConfig, useUpdateWhatsAppConfig } from '@/hooks/useWhatsApp';
import { PageContainer, PageHeader, Button, SkeletonText, Input } from '@/components/ui';
import type { ClinicWhatsAppConfigUpdate } from '@/types/whatsapp';

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
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
    <div className="flex items-center justify-between border-b border-gray-50 py-2.5 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary-600' : 'bg-gray-200',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

interface ConfigFormValues {
  evolution_instance_name: string;
  is_configured: boolean;
}

export default function WhatsAppConfigPage() {
  const user = useAuthStore((s) => s.user);
  const { data: config, isLoading } = useWhatsAppConfig();
  const updateMutation = useUpdateWhatsAppConfig();

  const { register, handleSubmit, reset } = useForm<ConfigFormValues>({
    defaultValues: {
      evolution_instance_name: '',
      is_configured: false,
    },
  });

  useEffect(() => {
    if (config) {
      reset({
        evolution_instance_name: config.evolution_instance_name,
        is_configured: config.is_configured,
      });
    }
  }, [config, reset]);

  if (user?.role !== 'admin') {
    return (
      <PageContainer size="md">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Acesso restrito a administradores.
        </div>
      </PageContainer>
    );
  }

  function onSubmit(values: ConfigFormValues) {
    const trimmed = values.evolution_instance_name.trim();
    if (!trimmed) {
      toast.error('Nome da instância é obrigatório.');
      return;
    }
    updateMutation.mutate(
      { evolution_instance_name: trimmed, is_configured: values.is_configured },
      {
        onSuccess: () => toast.success('Configuração salva com sucesso.'),
        onError: () => toast.error('Erro ao salvar configuração.'),
      },
    );
  }

  function handleToggle(field: keyof Pick<ClinicWhatsAppConfigUpdate, 'reminders_24h_enabled' | 'reminders_2h_enabled'>, value: boolean) {
    updateMutation.mutate(
      { [field]: value },
      {
        onSuccess: () => toast.success('Preferência atualizada.'),
        onError: () => toast.error('Erro ao atualizar preferência.'),
      },
    );
  }

  return (
    <PageContainer size="md">
      <PageHeader title="Integração WhatsApp" subtitle="Gerencie a instância Evolution e os lembretes automáticos" />

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <SkeletonText lines={3} />
        </div>
      ) : (
        <div className="space-y-4">
          <Section title="Status da Instância" icon={MessageCircle}>
            <Field label="Nome da Instância" value={config?.evolution_instance_name} />
            <div className="flex items-center justify-between border-b border-gray-50 py-2.5 last:border-0">
              <span className="text-sm text-gray-500">Status</span>
              {config?.is_configured ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Configurado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                  <XCircle className="h-3 w-3" />
                  Não configurado
                </span>
              )}
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-500">Webhook URL</span>
              <span className="max-w-xs truncate text-right text-xs font-mono text-gray-700">
                {config?.webhook_url || '—'}
              </span>
            </div>
          </Section>

          <Section title="Configuração da Instância" icon={MessageCircle}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Nome da Instância
                </label>
                <Input
                  {...register('evolution_instance_name')}
                  placeholder="ex: wquiro-clinica-01"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="is_configured"
                  type="checkbox"
                  {...register('is_configured')}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="is_configured" className="text-sm text-gray-700">
                  Instância configurada
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={updateMutation.isPending}>
                  Salvar
                </Button>
              </div>
            </form>
          </Section>

          <Section title="Lembretes Automáticos" icon={MessageCircle}>
            <ToggleRow
              label="Lembrete 24h antes"
              description="Envia mensagem WhatsApp um dia antes da consulta"
              checked={config?.reminders_24h_enabled ?? false}
              onChange={(checked) => handleToggle('reminders_24h_enabled', checked)}
              disabled={updateMutation.isPending}
            />
            <ToggleRow
              label="Lembrete 2h antes"
              description="Envia mensagem WhatsApp duas horas antes da consulta"
              checked={config?.reminders_2h_enabled ?? false}
              onChange={(checked) => handleToggle('reminders_2h_enabled', checked)}
              disabled={updateMutation.isPending}
            />
          </Section>
        </div>
      )}
    </PageContainer>
  );
}
