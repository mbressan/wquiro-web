import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal, FormField, Input, Select, Button } from '@/components/ui';
import type { InviteCreate, ProfessionalRole } from '@/types/professional';
import { useCreateInvite } from '@/hooks/useProfessionals';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  role: z.enum(['professional', 'receptionist'] as const),
});

type FormData = z.infer<typeof schema>;

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteModal({ open, onOpenChange, onSuccess }: InviteModalProps) {
  const createInvite = useCreateInvite();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'professional' },
  });

  useEffect(() => {
    if (open) reset({ email: '', role: 'professional' });
  }, [open, reset]);

  async function onSubmit(values: FormData) {
    const payload: InviteCreate = {
      email: values.email,
      role: values.role as ProfessionalRole,
    };
    try {
      await createInvite.mutateAsync(payload);
      toast.success('Convite enviado com sucesso!');
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } };
      if (axiosErr?.response?.status === 402) {
        toast.error('Limite de profissionais atingido. Faça upgrade do plano.');
      } else {
        const msg = axiosErr?.response?.data?.detail ?? 'Erro ao enviar convite.';
        toast.error(msg);
      }
    }
  }

  if (!open) return null;

  return (
    <Modal
      title="Convidar Profissional"
      onClose={() => onOpenChange(false)}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="invite-form" loading={createInvite.isPending}>
            Enviar Convite
          </Button>
        </div>
      }
    >
      <form id="invite-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField id="invite-email" label="E-mail" required error={errors.email?.message}>
          <Input
            id="invite-email"
            {...register('email')}
            type="email"
            placeholder="profissional@clinica.com"
            error={!!errors.email}
          />
        </FormField>

        <FormField id="invite-role" label="Papel" required error={errors.role?.message}>
          <Select id="invite-role" {...register('role')} error={!!errors.role}>
            <option value="professional">Profissional</option>
            <option value="receptionist">Recepcionista</option>
          </Select>
        </FormField>
      </form>
    </Modal>
  );
}
