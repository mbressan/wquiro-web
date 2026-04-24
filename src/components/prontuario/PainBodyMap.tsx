const REGIONS = [
  { id: 'cervical', label: 'Cervical' },
  { id: 'ombro_esq', label: 'Ombro Esquerdo' },
  { id: 'ombro_dir', label: 'Ombro Direito' },
  { id: 'torácico', label: 'Torácico' },
  { id: 'lombar', label: 'Lombar' },
  { id: 'sacro', label: 'Sacro/Cóccix' },
  { id: 'quadril_esq', label: 'Quadril Esquerdo' },
  { id: 'quadril_dir', label: 'Quadril Direito' },
  { id: 'joelho_esq', label: 'Joelho Esquerdo' },
  { id: 'joelho_dir', label: 'Joelho Direito' },
];

interface PainBodyMapProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function PainBodyMap({ selected, onChange }: PainBodyMapProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((r) => r !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">Localização da Dor</label>
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => toggle(r.id)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              selected.includes(r.id)
                ? 'border-red-500 bg-red-100 text-red-700'
                : 'border-gray-300 text-gray-600 hover:border-gray-400'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
