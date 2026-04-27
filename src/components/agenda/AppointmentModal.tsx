
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfessionals, useSlots } from '@/hooks/useProfessionals';
import { useSessionPackages } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { PatientQuickCreate } from './PatientQuickCreate';
import type { AppointmentCreate } from '@/types/appointment';

const schema = z
  .object({
    patient: z.string().min(1, 'Paciente é obrigatório'),
    professional: z.string().min(1, 'Profissional é obrigatório'),
    scheduled_at: z.string().min(1, 'Horário de início é obrigatório'),
    end_at: z.string().min(1, 'Horário de término é obrigatório'),
    appointment_type: z.string().optional(),
    notes: z.string().optional(),
    session_package: z.string().optional(),
  })
  .refine((d) => new Date(d.end_at) > new Date(d.scheduled_at), {
    message: 'Horário de término deve ser após o início.',
    path: ['end_at'],
  });

type FormData = z.infer<typeof schema>;

interface AppointmentModalProps {
  patientId?: string;
  defaultDate?: string;
  onSubmit: (data: AppointmentCreate) => void;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
}

export function AppointmentModal({
  patientId,
  defaultDate,
  onSubmit,
  isLoading,
  error,
  onClose,
}: AppointmentModalProps) {
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient: patientId ?? '',
      scheduled_at: defaultDate ?? '',
    },
  });

  const professional = watch('professional');
  const scheduledAt = watch('scheduled_at');
  const date = scheduledAt ? scheduledAt.split('T')[0] : '';

  const { data: professionals } = useProfessionals();
  useSlots(professional, date);
  const { data: packages } = useSessionPackages(patientId);
  const { data: patientsData } = usePatients();
  const patients = patientsData?.results ?? [];

  function handleFormSubmit(values: FormData) {
    const payload: AppointmentCreate = {
      patient: values.patient,
      professional: values.professional,
      scheduled_at: values.scheduled_at,
      end_at: values.end_at,
      appointment_type: values.appointment_type,
      notes: values.notes,
      session_package: values.session_package || undefined,
    };
    onSubmit(payload);
  }

  function handlePatientCreated(patientId: string) {
    setValue('patient', patientId);
    setShowQuickCreate(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nova Consulta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {error && (
          <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
          {/* Patient */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Paciente *</label>
              {!showQuickCreate && (
                <button
                  type="button"
                  onClick={() => setShowQuickCreate(true)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + Novo paciente
                </button>
              )}
            </div>
            {showQuickCreate ? (
              <PatientQuickCreate
                onCreated={(id) => handlePatientCreated(id)}
                onCancel={() => setShowQuickCreate(false)}
              />
            ) : (
              <>
                <select
                  {...register('patient')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Selecione...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.patient && (
                  <p className="text-xs text-red-600">{errors.patient.message}</p>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Profissional *</label>
            <select
              {...register('professional')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {professionals?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.professional && (
              <p className="text-xs text-red-600">{errors.professional.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Início *</label>
            <input
              {...register('scheduled_at')}
              type="datetime-local"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.scheduled_at && (
              <p className="text-xs text-red-600">{errors.scheduled_at.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Término *</label>
            <input
              {...register('end_at')}
              type="datetime-local"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.end_at && (
              <p className="text-xs text-red-600">{errors.end_at.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <input
              {...register('appointment_type')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="ex: Avaliação, Retorno..."
            />
          </div>

          {packages && packages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Pacote de Sessões</label>
              <select
                {...register('session_package')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Sem pacote</option>
                {packages.filter((p) => p.is_valid).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.remaining_sessions} sessões)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
