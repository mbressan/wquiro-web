import { useForm, Controller } from 'react-hook-form';
import { Input, Textarea, Button } from '@/components/ui';
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

export function SOAPForm({ defaultValues, onSubmit, isLoading }: SOAPFormProps) {
  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Evolução</h3>
        <div>
          <label className="block text-xs font-medium text-gray-600">Feedback do Paciente</label>
          <textarea {...register('patient_feedback')} rows={2} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder-gray-400 transition-colors hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Técnicas Utilizadas</label>
          <input {...register('techniques_used')} placeholder="Separar por vírgula" className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder-gray-400 transition-colors hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Avaliação</h3>
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
            <textarea {...register(f)} rows={2} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder-gray-400 transition-colors hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        ))}
      </section>

      <Button type="submit" loading={isLoading} className="w-full">
        Salvar Evolução
      </Button>
    </form>
  );
}
