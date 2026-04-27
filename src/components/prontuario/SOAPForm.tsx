import { useForm, Controller } from 'react-hook-form';
import { Button, FormField, Input, Textarea } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PainScaleEVA } from './PainScaleEVA';
import { PainBodyMap } from './PainBodyMap';
import { SpineMapCanvas } from './SpineMapCanvas';
import { spineDataToUI, uiToSpinePayload } from '@/lib/spineMapAdapters';
import type { SpineMapData } from '@/types/spineMap';

const TECHNIQUE_OPTIONS = [
  'Diversificada', 'Thompson', 'Activator', 'Gonstead', 'Drop', 'SOT', 'Outro',
] as const;

const schema = z.object({
  pain_scale: z.number().min(0).max(10).optional(),
  pain_locations: z.array(z.string()).optional(),
  patient_feedback: z.string().optional(),
  techniques_used: z.string().optional(),
  spine_map: z
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
    .optional(),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface SOAPFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
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

export function SOAPForm({ defaultValues, onSubmit, isLoading }: SOAPFormProps) {
  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-gray-100">
      <SectionCard title="Evolução">
        <FormField label="Feedback do Paciente">
          <Textarea {...register('patient_feedback')} rows={2} />
        </FormField>
        <FormField label="Técnicas Utilizadas">
          <Input {...register('techniques_used')} placeholder="Separar por vírgula" />
        </FormField>
      </SectionCard>

      <SectionCard title="Avaliação">
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

      <div className="px-5 py-4">
        <Button type="submit" loading={isLoading} className="w-full">
          Salvar Evolução
        </Button>
      </div>
    </form>
  );
}
