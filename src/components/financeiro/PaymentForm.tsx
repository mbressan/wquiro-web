import { useForm } from 'react-hook-form';
import type { PaymentCreate } from '@/types/financial';

const METHOD_LABELS: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  cash: 'Dinheiro',
  bank_slip: 'Boleto',
};

interface FormData {
  appointment?: string;
  patient: string;
  amount: string;
  payment_method: PaymentCreate['payment_method'];
  paid_at: string;
  notes?: string;
}

interface PaymentFormProps {
  onSubmit: (data: PaymentCreate) => void;
  isLoading?: boolean;
  defaultAppointmentId?: string;
  defaultPatientId?: string;
}

export function PaymentForm({ onSubmit, isLoading, defaultAppointmentId, defaultPatientId }: PaymentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      appointment: defaultAppointmentId ?? '',
      patient: defaultPatientId ?? '',
      paid_at: new Date().toISOString().slice(0, 16),
    },
  });

  function handleFormSubmit(values: FormData) {
    const amount = parseFloat(values.amount);
    if (isNaN(amount) || amount <= 0) return;
    const payload: PaymentCreate = {
      patient: values.patient,
      amount,
      payment_method: values.payment_method,
      paid_at: values.paid_at,
      notes: values.notes,
    };
    if (values.appointment) payload.appointment = values.appointment;
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor *</label>
          <input
            {...register('amount', { required: 'Obrigatório' })}
            type="number"
            step="0.01"
            min="0"
            className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
          />
          {errors.amount && <p className="text-xs text-red-600">{errors.amount.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Método *</label>
          <select
            {...register('payment_method', { required: 'Obrigatório' })}
            className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {Object.entries(METHOD_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          {errors.payment_method && <p className="text-xs text-red-600">{errors.payment_method.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Data/Hora *</label>
        <input
          {...register('paid_at', { required: 'Obrigatório' })}
          type="datetime-local"
          className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
        />
        {errors.paid_at && <p className="text-xs text-red-600">{errors.paid_at.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observações</label>
        <textarea {...register('notes')} rows={2} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-green-600 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
      >
        {isLoading ? 'Registrando...' : 'Registrar Pagamento'}
      </button>
    </form>
  );
}

