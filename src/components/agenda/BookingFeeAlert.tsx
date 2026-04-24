import { toast } from 'sonner';
import { useGeneratePaymentLink } from '@/hooks/useAppointments';
import type { Appointment } from '@/types/appointment';

interface BookingFeeAlertProps {
  appointment: Appointment;
}

export function BookingFeeAlert({ appointment }: BookingFeeAlertProps) {
  const generate = useGeneratePaymentLink(appointment.id);

  if (!appointment.booking_fee_required || appointment.booking_fee_paid) {
    return null;
  }

  function handleGenerate() {
    generate.mutate(undefined, {
      onSuccess: () => toast.success('Link de pagamento enviado!'),
      onError: () => toast.error('Erro ao gerar link de pagamento.'),
    });
  }

  return (
    <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800 flex items-center justify-between gap-4">
      <span>Taxa de agendamento pendente — R$ {appointment.booking_fee_amount}</span>
      <button
        onClick={handleGenerate}
        disabled={generate.isPending}
        className="rounded bg-yellow-600 px-3 py-1 text-xs text-white hover:bg-yellow-700 disabled:opacity-50"
      >
        {generate.isPending ? 'Gerando...' : 'Gerar / Reenviar Link'}
      </button>
    </div>
  );
}
