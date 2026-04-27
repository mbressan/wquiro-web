import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfessionals } from '@/hooks/useProfessionals';
import { EventRecurrenceFields } from './EventRecurrenceFields';
import { Modal, FormField, Input, Select, Textarea, Button } from '@/components/ui';
import type { AgendaEventCreate, AgendaEventType } from '@/types/agenda';

const EVENT_TYPES: { value: AgendaEventType; label: string }[] = [
  { value: 'unavailable', label: 'Indisponível' },
  { value: 'external_commitment', label: 'Compromisso Externo' },
  { value: 'personal_break', label: 'Pausa Pessoal' },
];

const schema = z
  .object({
    professional: z.string().min(1, 'Profissional é obrigatório'),
    start_at: z.string().min(1, 'Início é obrigatório'),
    end_at: z.string().min(1, 'Término é obrigatório'),
    event_type: z.enum(['unavailable', 'external_commitment', 'personal_break']),
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional(),
    is_recurring: z.boolean(),
    recurrence_frequency: z.enum(['weekly', 'monthly']).optional(),
    recurrence_weekday: z.string().optional(),
    recurrence_day_of_month: z.string().optional(),
    recurrence_until_date: z.string().optional(),
    recurrence_count: z.string().optional(),
  })
  .refine((d) => new Date(d.end_at) > new Date(d.start_at), {
    message: 'Término deve ser após o início.',
    path: ['end_at'],
  });

type FormData = z.infer<typeof schema>;

interface AgendaEventModalProps {
  defaultProfessional?: string;
  defaultStart?: string;
  onSubmit: (data: AgendaEventCreate) => void;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function AgendaEventModal({
  defaultProfessional,
  defaultStart,
  onSubmit,
  onClose,
  isLoading,
  error,
}: AgendaEventModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      professional: defaultProfessional ?? '',
      start_at: defaultStart ?? '',
      event_type: 'unavailable' as const,
      is_recurring: false,
    },
  });

  const isRecurring = watch('is_recurring');
  const { data: professionals } = useProfessionals();

  const handleFormSubmit: SubmitHandler<FormData> = (values) => {
    const payload: AgendaEventCreate = {
      professional: values.professional,
      start_at: values.start_at,
      end_at: values.end_at,
      event_type: values.event_type,
      title: values.title,
      description: values.description,
    };

    if (values.is_recurring && values.recurrence_frequency) {
      payload.recurrence_rule = {
        frequency: values.recurrence_frequency,
        ...(values.recurrence_frequency === 'weekly' && values.recurrence_weekday
          ? { weekday: parseInt(values.recurrence_weekday, 10) }
          : {}),
        ...(values.recurrence_frequency === 'monthly' && values.recurrence_day_of_month
          ? { day_of_month: parseInt(values.recurrence_day_of_month, 10) }
          : {}),
        ...(values.recurrence_until_date ? { until_date: values.recurrence_until_date } : {}),
        ...(values.recurrence_count ? { count: parseInt(values.recurrence_count, 10) } : {}),
      };
    }

    onSubmit(payload);
  };

  return (
    <Modal title="Novo Evento de Agenda" onClose={onClose} size="md">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField id="professional" label="Profissional" required error={errors.professional?.message}>
          <Select id="professional" {...register('professional')} error={!!errors.professional}>
            <option value="">Selecione...</option>
            {professionals?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </FormField>

        <FormField id="event_type" label="Tipo" required>
          <Select id="event_type" {...register('event_type')}>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </FormField>

        <FormField id="title" label="Título" required error={errors.title?.message}>
          <Input id="title" type="text" {...register('title')} error={!!errors.title} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="start_at" label="Início" required error={errors.start_at?.message}>
            <Input id="start_at" type="datetime-local" {...register('start_at')} error={!!errors.start_at} />
          </FormField>
          <FormField id="end_at" label="Término" required error={errors.end_at?.message}>
            <Input id="end_at" type="datetime-local" {...register('end_at')} error={!!errors.end_at} />
          </FormField>
        </div>

        <FormField id="description" label="Descrição">
          <Textarea id="description" {...register('description')} rows={2} />
        </FormField>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_recurring"
            {...register('is_recurring')}
            className="h-4 w-4 rounded border-gray-300 text-primary-600"
          />
          <label htmlFor="is_recurring" className="text-sm text-gray-700">
            Evento recorrente
          </label>
        </div>

        {isRecurring && <EventRecurrenceFields register={register} watch={watch} errors={errors} />}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
