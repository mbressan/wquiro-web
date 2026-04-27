import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePatient } from '@/hooks/usePatients';
import type { PatientCreate } from '@/types/patient';

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface PatientQuickCreateProps {
  /** Called with the new patient id after successful creation. */
  onCreated: (patientId: string, patientName: string) => void;
  onCancel: () => void;
}

/**
 * Inline mini-form to create a patient without leaving the appointment flow.
 * Shown inside AppointmentModal when the user clicks "Novo paciente".
 */
export function PatientQuickCreate({ onCreated, onCancel }: PatientQuickCreateProps) {
  const createPatient = useCreatePatient();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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
        setApiError('Limite de pacientes atingido. Faça upgrade do seu plano para adicionar mais.');
      } else {
        setApiError('Erro ao cadastrar paciente. Verifique os dados e tente novamente.');
      }
    }
  }

  return (
    <div className="rounded-md border border-indigo-200 bg-indigo-50 p-3 space-y-3">
      <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
        Novo paciente
      </p>

      {apiError && (
        <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">{apiError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome *</label>
          <input
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
          {errors.name && (
            <p className="mt-0.5 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone *</label>
            <input
              type="tel"
              {...register('phone')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            {errors.phone && (
              <p className="mt-0.5 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            {errors.email && (
              <p className="mt-0.5 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Data de nascimento</label>
          <input
            type="date"
            {...register('date_of_birth')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createPatient.isPending}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {createPatient.isPending ? 'Salvando...' : 'Criar paciente'}
          </button>
        </div>
      </form>
    </div>
  );
}
