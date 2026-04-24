interface PainScaleEVAProps {
  value: number;
  onChange: (value: number) => void;
}

const LABELS = ['Sem dor', 'Muito leve', 'Leve', 'Moderada', 'Moderada', 'Moderada', 'Intensa', 'Intensa', 'Muito intensa', 'Severa', 'Insuportável'];
const COLORS = ['#22c55e', '#86efac', '#a3e635', '#facc15', '#fb923c', '#f97316', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];

export function PainScaleEVA({ value, onChange }: PainScaleEVAProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Escala de Dor EVA (0–10)</label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <span
          className="w-12 text-center rounded-full py-1 text-sm font-bold text-white"
          style={{ backgroundColor: COLORS[value] }}
        >
          {value}
        </span>
      </div>
      <p className="text-xs text-gray-500">{LABELS[value]}</p>
    </div>
  );
}
