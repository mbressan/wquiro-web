import type { UseFormRegister, UseFormWatch, FieldErrors } from 'react-hook-form';

const WEEKDAYS = [
  { value: 0, label: 'Segunda' },
  { value: 1, label: 'Terça' },
  { value: 2, label: 'Quarta' },
  { value: 3, label: 'Quinta' },
  { value: 4, label: 'Sexta' },
  { value: 5, label: 'Sábado' },
  { value: 6, label: 'Domingo' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface EventRecurrenceFieldsProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
}

/**
 * Recurrence configuration fields — embedded inside AgendaEventModal when
 * the user activates the "recurring event" toggle.
 */
export function EventRecurrenceFields({ register, watch, errors }: EventRecurrenceFieldsProps) {
  const frequency = watch('recurrence_frequency');

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recorrência</p>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Frequência *</label>
        <select
          {...register('recurrence_frequency')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Selecione...</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
        </select>
        {errors.recurrence_frequency && (
          <p className="mt-1 text-xs text-red-600">{String(errors.recurrence_frequency.message)}</p>
        )}
      </div>

      {/* Weekly: weekday selector */}
      {frequency === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Dia da semana</label>
          <select
            {...register('recurrence_weekday')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Mesmo dia da semana do evento</option>
            {WEEKDAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Monthly: day of month */}
      {frequency === 'monthly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Dia do mês</label>
          <input
            type="number"
            min={1}
            max={31}
            {...register('recurrence_day_of_month')}
            placeholder="Mesmo dia do mês do evento"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      )}

      {/* End condition */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Até a data</label>
          <input
            type="date"
            {...register('recurrence_until_date')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ou nº de ocorrências</label>
          <input
            type="number"
            min={1}
            {...register('recurrence_count')}
            placeholder="Ex: 10"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
