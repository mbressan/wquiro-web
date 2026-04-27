import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Modal, FormField, Input, Textarea, Button } from '@/components/ui';
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

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ name: specialty?.name ?? '', description: specialty?.description ?? '' });
    }
  }, [open, specialty, reset]);

  async function onSubmit(values: FormData) {
    const payload: SpecialtyCreate = { name: values.name, description: values.description || undefined };
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
      const axiosErr = err as { response?: { status?: number; data?: { name?: string[]; detail?: string } } };
      const data = axiosErr?.response?.data;
      if (axiosErr?.response?.status === 400 && data?.name) {
        setError('name', { message: data.name[0] });
      } else {
        toast.error(data?.detail ?? 'Erro ao salvar especialidade.');
      }
    }
  }

  if (!open) return null;

  return (
    <Modal
      title={isEdit ? 'Editar Especialidade' : 'Nova Especialidade'}
      onClose={() => onOpenChange(false)}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="specialty-form" loading={isSubmitting}>
            {isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      }
    >
      <form id="specialty-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField id="spec-name" label="Nome" required error={errors.name?.message}>
          <Input
            id="spec-name"
            {...register('name')}
            placeholder="Ex: Quiropraxia Esportiva"
            error={!!errors.name}
          />
        </FormField>

        <FormField id="spec-desc" label="Descrição">
          <Textarea id="spec-desc" {...register('description')} rows={3} placeholder="Descrição opcional" />
        </FormField>
      </form>
    </Modal>
  );
}
