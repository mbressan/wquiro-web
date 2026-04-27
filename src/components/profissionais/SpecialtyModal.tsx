import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import type { Specialty, SpecialtyCreate } from '@/types/professional';
import { useCreateSpecialty, useUpdateSpecialty } from '@/hooks/useSpecialties';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface SpecialtyModalProps {
  specialty?: Specialty;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SpecialtyModal({ specialty, open, onOpenChange, onSuccess }: SpecialtyModalProps) {
  const isEdit = !!specialty;
  const createSpecialty = useCreateSpecialty();
  const updateSpecialty = useUpdateSpecialty(specialty?.id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: specialty?.name ?? '',
        description: specialty?.description ?? '',
      });
    }
  }, [open, specialty, reset]);

  async function onSubmit(values: FormData) {
    const payload: SpecialtyCreate = {
      name: values.name,
      description: values.description || undefined,
    };

    try {
      if (isEdit) {
        await updateSpecialty.mutateAsync(payload);
        toast.success('Especialidade atualizada!');
      } else {
        await createSpecialty.mutateAsync(payload);
        toast.success('Especialidade criada!');
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { name?: string[]; detail?: string } };
      };
      const data = axiosErr?.response?.data;
      if (axiosErr?.response?.status === 400 && data?.name) {
        setError('name', { message: data.name[0] });
      } else {
        const msg = data?.detail ?? 'Erro ao salvar especialidade.';
        toast.error(msg);
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Editar Especialidade' : 'Nova Especialidade'}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Ex: Quiropraxia Esportiva"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Descrição opcional"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
