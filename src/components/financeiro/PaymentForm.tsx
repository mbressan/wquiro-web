import { useForm } from 'react-hook-form';
import { FormField, Input, Select, Textarea, Button } from '@/components/ui';
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
        <FormField id="amount" label="Valor" required error={errors.amount?.message}>
          <Input
            id="amount"
            {...register('amount', { required: 'Obrigatório' })}
            type="number"
            step="0.01"
            min="0"
            error={!!errors.amount}
          />
        </FormField>
        <FormField id="payment_method" label="Método" required error={errors.payment_method?.message}>
          <Select
            id="payment_method"
            {...register('payment_method', { required: 'Obrigatório' })}
            error={!!errors.payment_method}
          >
            <option value="">Selecione...</option>
            {Object.entries(METHOD_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField id="paid_at" label="Data/Hora" required error={errors.paid_at?.message}>
        <Input
          id="paid_at"
          {...register('paid_at', { required: 'Obrigatório' })}
          type="datetime-local"
          error={!!errors.paid_at}
        />
      </FormField>

      <FormField id="notes" label="Observações">
        <Textarea id="notes" {...register('notes')} rows={2} />
      </FormField>

      <Button type="submit" loading={isLoading} className="w-full">
        Registrar Pagamento
      </Button>
    </form>
  );
}
