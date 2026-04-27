import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Professional, ProfessionalCreate, ProfessionalUpdate } from '@/types/professional';
import { useCreateProfessional, useUpdateProfessional } from '@/hooks/useProfessionals';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .optional()
    .or(z.literal('')),
  commission_percentage: z
    .union([z.number().min(0, 'Mínimo 0').max(100, 'Máximo 100'), z.null()])
    .optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ProfessionalModalProps {
  professional?: Professional;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ProfessionalModal({
  professional,
  open,
  onOpenChange,
  onSuccess,
}: ProfessionalModalProps) {
  const isEdit = !!professional;
  const [specialties, setSpecialties] = useState<string[]>(professional?.specialties ?? []);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const create = useCreateProfessional();
  const update = useUpdateProfessional();
  const isLoading = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name: professional?.name ?? '',
        email: professional?.email ?? '',
        phone: professional?.phone ?? '',
        commission_percentage: professional?.commission_percentage ?? null,
        notes: professional?.notes ?? '',
      });
      setSpecialties(professional?.specialties ?? []);
      setSpecialtyInput('');
      setServerError(null);
    }
  }, [open, professional, reset]);

  function addSpecialty() {
    const trimmed = specialtyInput.trim();
    if (!trimmed) return;
    if (!specialties.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setSpecialties((prev) => [...prev, trimmed]);
    }
    setSpecialtyInput('');
  }

  function removeSpecialty(s: string) {
    setSpecialties((prev) => prev.filter((x) => x !== s));
  }

  async function onSubmit(values: FormData) {
    setServerError(null);
    try {
      if (isEdit && professional) {
        const payload: ProfessionalUpdate = {
          name: values.name,
          phone: values.phone || '',
          specialties,
          commission_percentage: values.commission_percentage ?? null,
          notes: values.notes ?? '',
        };
        await update.mutateAsync({ id: professional.id, data: payload });
      } else {
        const payload: ProfessionalCreate = {
          name: values.name!,
          email: values.email!,
          role: 'professional',
          phone: values.phone || '',
          specialties,
          commission_percentage: values.commission_percentage ?? null,
          notes: values.notes ?? '',
        };
        await create.mutateAsync(payload);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const data = axiosErr?.response?.data;
      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages[0] : String(messages);
          if (field === 'detail') {
            setServerError(msg);
          } else {
            setError(field as keyof FormData, { message: msg });
          }
        });
      } else {
        setServerError('Erro ao salvar. Tente novamente.');
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Editar Profissional' : 'Novo Profissional'}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
          {serverError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
          )}

          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nome *</label>
            <input
              {...register('name')}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome completo"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email — readonly in edit mode */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              E-mail {!isEdit && '*'}
            </label>
            <input
              {...register('email')}
              type="email"
              readOnly={isEdit}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isEdit ? 'cursor-not-allowed bg-gray-50 text-gray-500' : ''
              }`}
              placeholder="email@clinica.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Telefone</label>
            <input
              {...register('phone')}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="11999990000"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Specialties */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Especialidades</label>
            <div className="flex gap-2">
              <input
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSpecialty();
                  }
                }}
                className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite e pressione Enter"
              />
              <button
                type="button"
                onClick={addSpecialty}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Adicionar
              </button>
            </div>
            {specialties.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {specialties.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(s)}
                      className="ml-0.5 rounded-full text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Commission */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Comissão (%)
            </label>
            <input
              {...register('commission_percentage', { valueAsNumber: true })}
              type="number"
              min="0"
              max="100"
              step="0.01"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 35.50"
            />
            {errors.commission_percentage && (
              <p className="mt-1 text-xs text-red-500">{errors.commission_percentage.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas internas..."
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
