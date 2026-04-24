const SPINE_REGIONS = [
  { label: 'Cervical', vertebrae: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'] },
  { label: 'Torácica', vertebrae: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'] },
  { label: 'Lombar', vertebrae: ['L1', 'L2', 'L3', 'L4', 'L5'] },
  { label: 'Sacro/Cóccix', vertebrae: ['S1', 'sacro', 'cóccix'] },
];

interface SpineMapCheckboxProps {
  adjusted: string[];
  onChange: (adjusted: string[]) => void;
}

export function SpineMapCheckbox({ adjusted, onChange }: SpineMapCheckboxProps) {
  function toggle(v: string) {
    if (adjusted.includes(v)) {
      onChange(adjusted.filter((a) => a !== v));
    } else {
      onChange([...adjusted, v]);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Mapa de Coluna — Vértebras Ajustadas</label>
      {SPINE_REGIONS.map((region) => (
        <div key={region.label}>
          <p className="text-xs font-semibold text-gray-500 mb-1">{region.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {region.vertebrae.map((v) => (
              <label key={v} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adjusted.includes(v)}
                  onChange={() => toggle(v)}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-xs text-gray-700">{v}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {adjusted.length > 0 && (
        <p className="text-xs text-blue-600">Selecionados: {adjusted.join(', ')}</p>
      )}
    </div>
  );
}
