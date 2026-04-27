import { useProfessionals } from '@/hooks/useProfessionals';
import type { AgendaContext } from '@/types/agenda';

interface ContextSelectorProps {
  context: AgendaContext;
  onChange: (ctx: AgendaContext) => void;
}

/**
 * Allows switching between the general agenda (all professionals) and a
 * specific professional's individual agenda using a single dropdown.
 */
export function ContextSelector({ context, onChange }: ContextSelectorProps) {
  const { data: professionals } = useProfessionals();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="agenda-context" className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Visualizando:
      </label>
      <select
        id="agenda-context"
        value={context ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Todos os profissionais</option>
        {professionals?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
