import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePatient } from '@/hooks/usePatients';
import { FormField, Input, Button } from '@/components/ui';
import type { PatientCreate } from '@/types/patient';

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface PatientQuickCreateProps {
  onCreated: (patientId: string, patientName: string) => void;
  onCancel: () => void;
}

export function PatientQuickCreate({ onCreated, onCancel }: PatientQuickCreateProps) {
  const createPatient = useCreatePatient();
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormData) {
    setApiError(null);
    const payload: PatientCreate = {
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      date_of_birth: values.date_of_birth || '',
    };
    try {
      const patient = await createPatient.mutateAsync(payload);
      onCreated(patient.id, patient.name);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 402) {
        setApiError('Limite de pacientes atingido. Faça upgrade do seu plano.');
      } else {
        setApiError('Erro ao cadastrar paciente. Verifique os dados e tente novamente.');
      }
    }
  }

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
        Novo paciente
      </p>

      {apiError && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{apiError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <FormField id="qc-name" label="Nome" required error={errors.name?.message}>
          <Input id="qc-name" type="text" {...register('name')} error={!!errors.name} />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="qc-phone" label="Telefone" required error={errors.phone?.message}>
            <Input id="qc-phone" type="tel" {...register('phone')} error={!!errors.phone} />
          </FormField>
          <FormField id="qc-email" label="E-mail" error={errors.email?.message}>
            <Input id="qc-email" type="email" {...register('email')} error={!!errors.email} />
          </FormField>
        </div>

        <FormField id="qc-dob" label="Data de nascimento">
          <Input id="qc-dob" type="date" {...register('date_of_birth')} />
        </FormField>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={createPatient.isPending}>
            Criar paciente
          </Button>
        </div>
      </form>
    </div>
  );
}
