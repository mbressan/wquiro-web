import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PatientCreate, PatientDetail } from '@/types/patient';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  cpf: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['M', 'F', 'O', 'N']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  profession: z.string().optional(),
  referred_by: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  tags: z.string().optional(), // comma-separated tag names
});

type FormData = z.infer<typeof schema>;

interface PatientFormProps {
  defaultValues?: PatientDetail;
  onSubmit: (data: PatientCreate) => void;
  isLoading?: boolean;
  error?: string | null;
  onCancel?: () => void;
}

export function PatientForm({
  defaultValues,
  onSubmit,
  isLoading,
  error,
  onCancel,
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        date_of_birth: defaultValues.date_of_birth ?? undefined,
        tags: defaultValues.tags.map((t) => t.name).join(', '),
      });
    }
  }, [defaultValues, reset]);

  function handleFormSubmit(values: FormData) {
    const { tags, ...rest } = values;
    const tagList = tags
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    onSubmit({ ...rest, tags: tagList } as PatientCreate);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Telefone <span className="text-red-500">*</span>
          </label>
          <input
            {...register('phone')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            {...register('email')}
            type="email"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CPF</label>
          <input
            {...register('cpf')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="000.000.000-00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
          <input
            {...register('date_of_birth')}
            type="date"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gênero</label>
          <select
            {...register('gender')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="N">Não Informado</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
            <option value="O">Outro</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Tags (separadas por vírgula)
          </label>
          <input
            {...register('tags')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            placeholder="ex: convenio, fisioterapia"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Observações</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
