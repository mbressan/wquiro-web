import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { SIGNATURE_LABELS, type SignatureType } from '@/types/record';
import { useFinalize } from '@/hooks/useAppointments';

interface FinalizarDrawerProps {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
  onSuccess: () => void;
}

export function FinalizarDrawer({ open, onClose, appointmentId, onSuccess }: FinalizarDrawerProps) {
  const [signatureType, setSignatureType] = useState<SignatureType>('none');
  const { mutateAsync, isPending } = useFinalize(appointmentId);

  if (!open) return null;

  async function handleFinalizar() {
    try {
      await mutateAsync({ signature_type: signatureType });
      toast.success('Atendimento finalizado.');
      onSuccess();
    } catch {
      toast.error('Erro ao finalizar atendimento.');
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-80 bg-white z-50 shadow-xl flex flex-col
          translate-x-0 transition-transform duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Finalizar atendimento"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800">Finalizar atendimento</span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <p className="text-sm text-gray-600">
            Atenção: esta ação é <strong>irreversível</strong>. O prontuário será bloqueado
            para edição após a finalização.
          </p>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700 mb-2">
              Tipo de assinatura
            </legend>
            {(Object.entries(SIGNATURE_LABELS) as [SignatureType, string][]).map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
              >
                <input
                  type="radio"
                  name="signature_type"
                  value={value}
                  checked={signatureType === value}
                  onChange={() => setSignatureType(value)}
                  className="accent-blue-600"
                />
                {label}
              </label>
            ))}
          </fieldset>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200">
          <button
            type="button"
            onClick={handleFinalizar}
            disabled={isPending}
            className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Finalizando...' : 'Finalizar'}
          </button>
        </div>
      </div>
    </>
  );
}
