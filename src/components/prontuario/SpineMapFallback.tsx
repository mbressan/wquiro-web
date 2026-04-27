import { SPINE_REGIONS } from "@/lib/spineConfig";
import type { SpineMapData, SpineMapTechnique, TechniqueOption } from "@/types/spineMap";

const TECHNIQUE_OPTIONS: TechniqueOption[] = [
  "Diversificada",
  "Thompson",
  "Activator",
  "Gonstead",
  "Drop",
  "SOT",
  "Outro",
];

interface SpineMapFallbackProps {
  selected: string[];
  techniques: SpineMapTechnique[];
  onChange: (data: SpineMapData) => void;
  readOnly?: boolean;
}

export function SpineMapFallback({ selected, techniques, onChange, readOnly }: SpineMapFallbackProps) {
  function toggleVertebra(vertebra: string) {
    if (readOnly) return;

    if (selected.includes(vertebra)) {
      onChange({
        adjusted: selected.filter((v) => v !== vertebra),
        techniques: techniques.filter((t) => t.vertebra !== vertebra),
      });
    } else {
      onChange({
        adjusted: [...selected, vertebra],
        techniques: [...techniques, { vertebra, technique: "Diversificada" }],
      });
    }
  }

  function updateTechnique(vertebra: string, technique: TechniqueOption) {
    if (readOnly) return;
    const existing = techniques.find((t) => t.vertebra === vertebra);
    if (existing) {
      onChange({
        adjusted: selected,
        techniques: techniques.map((t) => (t.vertebra === vertebra ? { ...t, technique } : t)),
      });
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Mapa de Coluna — Vértebras Ajustadas</label>
      {SPINE_REGIONS.map((region) => (
        <div key={region.name}>
          <p className="text-xs font-semibold text-gray-500 mb-1">{region.label}</p>
          <div className="flex flex-wrap gap-2">
            {region.vertebrae.map((v) => {
              const isSelected = selected.includes(v);
              const tech = techniques.find((t) => t.vertebra === v);
              return (
                <div key={v} className="flex flex-col gap-1">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleVertebra(v)}
                      disabled={readOnly}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-xs text-gray-700">{v}</span>
                  </label>
                  {isSelected && !readOnly && (
                    <select
                      value={tech?.technique ?? "Diversificada"}
                      onChange={(e) => updateTechnique(v, e.target.value as TechniqueOption)}
                      className="text-xs border rounded px-1 py-0.5"
                    >
                      {TECHNIQUE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  {isSelected && readOnly && tech && (
                    <span className="text-xs text-gray-500">{tech.technique}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {selected.length > 0 && (
        <p className="text-xs text-blue-600">Selecionados: {selected.join(", ")}</p>
      )}
    </div>
  );
}
