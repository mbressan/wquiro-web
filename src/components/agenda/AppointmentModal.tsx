
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfessionals, useSlots } from '@/hooks/useProfessionals';
import { useSessionPackages } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { PatientQuickCreate } from './PatientQuickCreate';
import { Modal, FormField, Input, Select, Textarea, Button } from '@/components/ui';
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
    <Modal title="Nova Consulta" onClose={onClose} size="md">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Patient */}
        <FormField id="patient" label="Paciente" required error={errors.patient?.message}>
          {showQuickCreate ? (
            <PatientQuickCreate
              onCreated={handlePatientCreated}
              onCancel={() => setShowQuickCreate(false)}
            />
          ) : (
            <div className="space-y-1">
              <Select id="patient" {...register('patient')} error={!!errors.patient}>
                <option value="">Selecione...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => setShowQuickCreate(true)}
                className="text-xs text-primary-600 hover:underline"
              >
                + Novo paciente
              </button>
            </div>
          )}
        </FormField>

        <FormField id="professional" label="Profissional" required error={errors.professional?.message}>
          <Select id="professional" {...register('professional')} error={!!errors.professional}>
            <option value="">Selecione...</option>
            {professionals?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="scheduled_at" label="Início" required error={errors.scheduled_at?.message}>
            <Input id="scheduled_at" type="datetime-local" {...register('scheduled_at')} error={!!errors.scheduled_at} />
          </FormField>

          <FormField id="end_at" label="Término" required error={errors.end_at?.message}>
            <Input id="end_at" type="datetime-local" {...register('end_at')} error={!!errors.end_at} />
          </FormField>
        </div>

        <FormField id="appointment_type" label="Tipo">
          <Input id="appointment_type" {...register('appointment_type')} placeholder="ex: Avaliação, Retorno..." />
        </FormField>

        {packages && packages.length > 0 && (
          <FormField id="session_package" label="Pacote de Sessões">
            <Select id="session_package" {...register('session_package')}>
              <option value="">Sem pacote</option>
              {packages.filter((p) => p.is_valid).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.remaining_sessions} sessões)
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField id="notes" label="Observações">
          <Textarea id="notes" {...register('notes')} rows={2} />
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            Agendar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
