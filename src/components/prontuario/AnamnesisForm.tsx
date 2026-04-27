import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, FormField, Input, Textarea, Select } from '@/components/ui';
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-gray-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-3">{children}</div>
    </div>
  );
}

const SOAP_LABELS: Record<string, string> = {
  subjective: 'Subjetivo (S)',
  objective: 'Objetivo (O)',
  assessment: 'Avaliação (A)',
  plan: 'Plano (P)',
};

export function AnamnesisForm({
  defaultValues,
  onSubmit,
  isLoading,
  posturalAssessment,
  onPosturalAssessmentChange,
}: AnamnesisFormProps) {
  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-gray-100">
      <SectionCard title="Queixa e História">
        <FormField label="Queixa Principal">
          <Input {...register('chief_complaint')} />
        </FormField>
        <FormField label="HMA (História da Moléstia Atual)">
          <Textarea {...register('hma')} rows={3} />
        </FormField>
        <FormField label="Antecedentes Pessoais">
          <Textarea {...register('past_history')} rows={2} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Ocupação">
            <Input {...register('occupation')} />
          </FormField>
          <FormField label="Atividade Física">
            <Input {...register('physical_activity')} />
          </FormField>
        </div>
        <FormField label="Medicamentos">
          <Input {...register('medications')} placeholder="Separar por vírgula" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Início">
            <Select {...register('onset')}>
              <option value="">—</option>
              <option value="gradual">Gradual</option>
              <option value="sudden">Súbito</option>
            </Select>
          </FormField>
          <FormField label="Data de Início">
            <Input type="date" {...register('onset_date')} />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Avaliação Clínica">
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
              <FormField label="Mapa de Coluna — Vértebras Ajustadas">
                <SpineMapCanvas
                  selected={spineData.adjusted}
                  techniques={spineData.techniques}
                  onChange={(data) => field.onChange(uiToSpinePayload(data))}
                />
              </FormField>
            );
          }}
        />
      </SectionCard>

      <SectionCard title="SOAP">
        {(['subjective', 'objective', 'assessment', 'plan'] as const).map((f) => (
          <FormField key={f} label={SOAP_LABELS[f]}>
            <Textarea {...register(f)} rows={2} />
          </FormField>
        ))}
      </SectionCard>

      {onPosturalAssessmentChange && (
        <SectionCard title="Avaliação Postural">
          <PosturalAssessmentForm
            value={posturalAssessment ?? emptyPosturalAssessment()}
            onChange={onPosturalAssessmentChange}
          />
        </SectionCard>
      )}

      <div className="px-5 py-4">
        <Button type="submit" loading={isLoading} className="w-full">
          Salvar Prontuário
        </Button>
      </div>
    </form>
  );
}
