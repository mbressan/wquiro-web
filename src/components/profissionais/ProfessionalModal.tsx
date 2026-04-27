import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, FormField, Input, Textarea, Button } from '@/components/ui';
import type { Professional, ProfessionalCreate, ProfessionalUpdate } from '@/types/professional';
import { useCreateProfessional, useUpdateProfessional, useProfessionalsAdmin } from '@/hooks/useProfessionals';
import { useSpecialties, useSetProfessionalSpecialties } from '@/hooks/useSpecialties';

const PROFESSIONAL_COLORS = [
  { hex: '#3b82f6', label: 'Azul' },
  { hex: '#ef4444', label: 'Vermelho' },
  { hex: '#10b981', label: 'Verde' },
  { hex: '#f59e0b', label: 'Âmbar' },
  { hex: '#8b5cf6', label: 'Roxo' },
  { hex: '#ec4899', label: 'Rosa' },
  { hex: '#06b6d4', label: 'Ciano' },
  { hex: '#f97316', label: 'Laranja' },
  { hex: '#64748b', label: 'Cinza-azul' },
  { hex: '#84cc16', label: 'Verde-lima' },
] as const;

function getNextColor(professionals: { color: string }[]): string {
  const usedColors = new Set(professionals.map((p) => p.color));
  return (
    PROFESSIONAL_COLORS.find(({ hex }) => !usedColors.has(hex))?.hex ??
    PROFESSIONAL_COLORS[0].hex
  );
}

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
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
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
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const create = useCreateProfessional();
  const update = useUpdateProfessional();
  const setSpecialties = useSetProfessionalSpecialties();
  const { data: availableSpecialties = [] } = useSpecialties();
  const { data: professionalsData } = useProfessionalsAdmin({ role: 'professional', is_active: true });
  const activeProfessionals = professionalsData?.results ?? [];
  const isLoading = create.isPending || update.isPending || setSpecialties.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
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
        color: professional?.color ?? getNextColor(activeProfessionals),
      });
      setSelectedSpecialtyIds(professional?.specialties?.map((s) => s.id) ?? []);
      setServerError(null);
    }
  }, [open, professional, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleSpecialty(id: string) {
    setSelectedSpecialtyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function onSubmit(values: FormData) {
    setServerError(null);
    try {
      let savedId: string;
      if (isEdit && professional) {
        const payload: ProfessionalUpdate = {
          name: values.name,
          phone: values.phone || '',
          commission_percentage: values.commission_percentage ?? null,
          notes: values.notes ?? '',
          color: values.color,
        };
        await update.mutateAsync({ id: professional.id, data: payload });
        savedId = professional.id;
      } else {
        const payload: ProfessionalCreate = {
          name: values.name!,
          email: values.email!,
          role: 'professional',
          phone: values.phone || '',
          commission_percentage: values.commission_percentage ?? null,
          notes: values.notes ?? '',
          color: values.color,
        };
        const created = await create.mutateAsync(payload);
        savedId = created.id;
      }
      await setSpecialties.mutateAsync({ userId: savedId, specialtyIds: selectedSpecialtyIds });
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
    <Modal
      title={isEdit ? 'Editar Profissional' : 'Novo Profissional'}
      onClose={() => onOpenChange(false)}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="professional-form" loading={isLoading}>
            {isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      }
    >
      <form id="professional-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</div>
        )}

        <FormField id="pro-name" label="Nome" required error={errors.name?.message}>
          <Input id="pro-name" {...register('name')} placeholder="Nome completo" error={!!errors.name} />
        </FormField>

        <FormField id="pro-email" label="E-mail" required={!isEdit} error={errors.email?.message}>
          <Input
            id="pro-email"
            {...register('email')}
            type="email"
            readOnly={isEdit}
            disabled={isEdit}
            placeholder="email@clinica.com"
            error={!!errors.email}
          />
        </FormField>

        <FormField id="pro-phone" label="Telefone" error={errors.phone?.message}>
          <Input id="pro-phone" {...register('phone')} placeholder="11999990000" error={!!errors.phone} />
        </FormField>

        <FormField id="pro-specialties" label="Especialidades">
          {availableSpecialties.length === 0 ? (
            <p className="text-xs text-gray-400">Carregando especialidades…</p>
          ) : (
            <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-300 p-2">
              {availableSpecialties.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedSpecialtyIds.includes(s.id)}
                    onChange={() => toggleSpecialty(s.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  />
                  <span className="text-gray-800">{s.name}</span>
                  {s.is_predefined && (
                    <span className="ml-auto text-xs text-violet-500">pré-definida</span>
                  )}
                </label>
              ))}
            </div>
          )}
          {selectedSpecialtyIds.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">{selectedSpecialtyIds.length} selecionada(s)</p>
          )}
        </FormField>

        <FormField id="pro-commission" label="Comissão (%)" error={errors.commission_percentage?.message}>
          <Input
            id="pro-commission"
            {...register('commission_percentage', { valueAsNumber: true })}
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="Ex: 35.50"
            error={!!errors.commission_percentage}
          />
        </FormField>

        <FormField id="pro-notes" label="Observações">
          <Textarea id="pro-notes" {...register('notes')} rows={3} placeholder="Notas internas..." />
        </FormField>

        <FormField id="pro-color" label="Cor na agenda" error={errors.color?.message}>
          <div className="flex flex-wrap gap-2">
            {PROFESSIONAL_COLORS.map(({ hex, label }) => (
              <button
                key={hex}
                type="button"
                title={label}
                onClick={() => setValue('color', hex, { shouldValidate: true })}
                className={[
                  'h-7 w-7 rounded-full border-2 transition-all',
                  watch('color') === hex
                    ? 'scale-110 border-gray-900 shadow-md'
                    : 'border-transparent hover:border-gray-400',
                ].join(' ')}
                style={{ backgroundColor: hex }}
                aria-label={label}
                aria-pressed={watch('color') === hex}
              />
            ))}
          </div>
        </FormField>
      </form>
    </Modal>
  );
}
