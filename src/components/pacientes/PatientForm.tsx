import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField, Input, Select, Textarea, Button } from '@/components/ui';
import type { PatientCreate, PatientDetail } from '@/types/patient';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  cpf: z.string().optional(),
  date_of_birth: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.enum(['M', 'F', 'O', 'N']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  profession: z.string().optional(),
  referred_by: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface PatientFormProps {
  defaultValues?: PatientDetail;
  onSubmit: (data: PatientCreate) => void;
  isLoading?: boolean;
  error?: string | null;
  onCancel?: () => void;
}

export function PatientForm({ defaultValues, onSubmit, isLoading, error, onCancel }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        phone: formatPhone(defaultValues.phone),
        date_of_birth: defaultValues.date_of_birth ?? undefined,
        tags: defaultValues.tags.map((t) => t.name).join(', '),
      });
    }
  }, [defaultValues, reset]);

  function handleFormSubmit(values: FormData) {
    const { tags, ...rest } = values;
    const tagList = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    const payload: PatientCreate = { ...rest, tags: tagList };
    (Object.keys(payload) as (keyof PatientCreate)[]).forEach((key) => {
      if (key !== 'date_of_birth' && payload[key] === '') delete payload[key];
    });
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="name" label="Nome" required error={errors.name?.message}>
          <Input id="name" {...register('name')} error={!!errors.name} />
        </FormField>

        <FormField id="phone" label="Telefone" required error={errors.phone?.message}>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="(11) 99999-9999"
            maxLength={15}
            error={!!errors.phone}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              e.target.value = formatted;
              setValue('phone', formatted, { shouldValidate: true });
            }}
          />
        </FormField>

        <FormField id="email" label="E-mail" error={errors.email?.message}>
          <Input id="email" type="email" {...register('email')} error={!!errors.email} />
        </FormField>

        <FormField id="cpf" label="CPF">
          <Input id="cpf" {...register('cpf')} placeholder="000.000.000-00" />
        </FormField>

        <FormField id="date_of_birth" label="Data de Nascimento" required error={errors.date_of_birth?.message}>
          <Input id="date_of_birth" type="date" {...register('date_of_birth')} error={!!errors.date_of_birth} />
        </FormField>

        <FormField id="gender" label="Gênero">
          <Select id="gender" {...register('gender')}>
            <option value="N">Não Informado</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
            <option value="O">Outro</option>
          </Select>
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="tags" label="Tags" hint="Separadas por vírgula">
            <Input id="tags" {...register('tags')} placeholder="ex: convenio, fisioterapia" />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField id="notes" label="Observações">
            <Textarea id="notes" {...register('notes')} rows={3} />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isLoading}>
          Salvar
        </Button>
      </div>
    </form>
  );
}
