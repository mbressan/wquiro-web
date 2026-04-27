import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProfessionals } from '@/hooks/useProfessionals';
import { EventRecurrenceFields } from './EventRecurrenceFields';
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
    // recurrence
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Novo Evento de Agenda</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
          {/* Professional */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Profissional *</label>
            <select
              {...register('professional')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {professionals?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.professional && (
              <p className="mt-1 text-xs text-red-600">{errors.professional.message}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo *</label>
            <select
              {...register('event_type')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Título *</label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Início *</label>
              <input
                type="datetime-local"
                {...register('start_at')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.start_at && (
                <p className="mt-1 text-xs text-red-600">{errors.start_at.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Término *</label>
              <input
                type="datetime-local"
                {...register('end_at')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.end_at && (
                <p className="mt-1 text-xs text-red-600">{errors.end_at.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              {...register('description')}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Recurrence toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_recurring"
              {...register('is_recurring')}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            <label htmlFor="is_recurring" className="text-sm text-gray-700">
              Evento recorrente
            </label>
          </div>

          {isRecurring && <EventRecurrenceFields register={register} watch={watch} errors={errors} />}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
