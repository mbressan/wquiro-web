import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'professional' },
  });

  useEffect(() => {
    if (open) {
      reset({ email: '', role: 'professional' });
    }
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
        toast.error(
          <span>
            Limite de profissionais atingido.{' '}
            <a href="/billing" className="underline">
              Faça upgrade do plano.
            </a>
          </span>,
        );
      } else {
        const msg = axiosErr?.response?.data?.detail ?? 'Erro ao enviar convite.';
        toast.error(msg);
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Convidar Profissional</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">E-mail *</label>
            <input
              {...register('email')}
              type="email"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="profissional@clinica.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Papel *</label>
            <select
              {...register('role')}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="professional">Profissional</option>
              <option value="receptionist">Recepcionista</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createInvite.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createInvite.isPending ? 'Enviando...' : 'Enviar Convite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
