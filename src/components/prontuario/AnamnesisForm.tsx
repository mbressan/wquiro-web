import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PainScaleEVA } from './PainScaleEVA';
import { PainBodyMap } from './PainBodyMap';
import { SpineMapCanvas } from './SpineMapCanvas';
import { spineDataToUI, uiToSpinePayload } from '@/lib/spineMapAdapters';
import type { SpineMapData } from '@/types/spineMap';
import { PosturalAssessmentForm } from './postural/PosturalAssessmentForm';
import { emptyPosturalAssessment } from '@/lib/posture-constants';
import type { PosturalAssessment } from '@/types/posture';

const TECHNIQUE_OPTIONS = [
  'Diversificada', 'Thompson', 'Activator', 'Gonstead', 'Drop', 'SOT', 'Outro',
] as const;

const spineMapSchema = z
  .object({
    adjusted: z.array(z.string()),
    techniques: z.array(
      z.object({
        vertebra: z.string(),
        technique: z.enum(TECHNIQUE_OPTIONS),
        notes: z.string().optional(),
      }),
    ),
    notes: z.string().optional(),
  })
  .optional();

const schema = z.object({
  chief_complaint: z.string().optional(),
  hma: z.string().optional(),
  past_history: z.string().optional(),
  occupation: z.string().optional(),
  physical_activity: z.string().optional(),
  medications: z.string().optional(),
  pain_scale: z.number().min(0).max(10).optional(),
  pain_locations: z.array(z.string()).optional(),
  onset: z.enum(['gradual', 'sudden']).optional().or(z.literal('')),
  onset_date: z.string().optional(),
  spine_map: spineMapSchema,
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AnamnesisFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  posturalAssessment?: PosturalAssessment;
  onPosturalAssessmentChange?: (value: PosturalAssessment) => void;
}

export function AnamnesisForm({ defaultValues, onSubmit, isLoading, posturalAssessment, onPosturalAssessmentChange }: AnamnesisFormProps) {
  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Queixa e História</h3>
        <div>
          <label className="block text-xs font-medium text-gray-600">Queixa Principal</label>
          <input {...register('chief_complaint')} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">HMA (História da Moléstia Atual)</label>
          <textarea {...register('hma')} rows={3} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Antecedentes Pessoais</label>
          <textarea {...register('past_history')} rows={2} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Ocupação</label>
            <input {...register('occupation')} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Atividade Física</label>
            <input {...register('physical_activity')} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Medicamentos</label>
          <input {...register('medications')} placeholder="Separar por vírgula" className="mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">Início</label>
            <select {...register('onset')} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm">
              <option value="">—</option>
              <option value="gradual">Gradual</option>
              <option value="sudden">Súbito</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Data de Início</label>
            <input type="date" {...register('onset_date')} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Avaliação Clínica</h3>
        <Controller
          control={control}
          name="pain_scale"
          defaultValue={0}
          render={({ field }) => (
            <PainScaleEVA value={field.value ?? 0} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="pain_locations"
          defaultValue={[]}
          render={({ field }) => (
            <PainBodyMap selected={field.value ?? []} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="spine_map"
          render={({ field }) => {
            const spineData: SpineMapData = spineDataToUI(field.value);
            return (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mapa de Coluna — Vértebras Ajustadas
                </label>
                <SpineMapCanvas
                  selected={spineData.adjusted}
                  techniques={spineData.techniques}
                  onChange={(data) => field.onChange(uiToSpinePayload(data))}
                />
              </div>
            );
          }}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">SOAP</h3>
        {(['subjective', 'objective', 'assessment', 'plan'] as const).map((f) => (
          <div key={f}>
            <label className="block text-xs font-medium text-gray-600 capitalize">{f}</label>
            <textarea {...register(f)} rows={2} className="mt-1 block w-full rounded-md border px-3 py-2 text-sm" />
          </div>
        ))}
      </section>

      {onPosturalAssessmentChange && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Avaliação Postural</h3>
          <PosturalAssessmentForm
            value={posturalAssessment ?? emptyPosturalAssessment()}
            onChange={onPosturalAssessmentChange}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Salvando...' : 'Salvar Prontuário'}
      </button>
    </form>
  );
}
