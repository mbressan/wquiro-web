import { useState } from "react";
import type { TechniqueOption } from "@/types/spineMap";

const TECHNIQUE_OPTIONS: TechniqueOption[] = [
  "Diversificada",
  "Thompson",
  "Activator",
  "Gonstead",
  "Drop",
  "SOT",
  "Outro",
];

interface TechniquePopoverProps {
  vertebra: string;
  technique: string | undefined;
  anchorPosition: { x: number; y: number };
  onSelect: (vertebra: string, technique: TechniqueOption, notes?: string) => void;
  onDeselect: (vertebra: string) => void;
  onClose: () => void;
}

export function TechniquePopover({
  vertebra,
  technique,
  anchorPosition,
  onSelect,
  onDeselect,
  onClose,
}: TechniquePopoverProps) {
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueOption>(
    (technique as TechniqueOption) ?? "Diversificada",
  );
  const [notes, setNotes] = useState("");

  function handleConfirm() {
    onSelect(vertebra, selectedTechnique, selectedTechnique === "Outro" ? notes : undefined);
    onClose();
  }

  function handleDeselect() {
    onDeselect(vertebra);
    onClose();
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-56"
        style={{ top: anchorPosition.y, left: anchorPosition.x }}
      >
        <p className="text-sm font-semibold text-gray-800 mb-3">
          Técnica — {vertebra}
        </p>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">Técnica</label>
          <select
            value={selectedTechnique}
            onChange={(e) => setSelectedTechnique(e.target.value as TechniqueOption)}
            className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TECHNIQUE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          {selectedTechnique === "Outro" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Observação</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descreva a técnica..."
                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full bg-blue-600 text-white text-sm rounded px-3 py-1.5 hover:bg-blue-700 transition-colors"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={handleDeselect}
              className="w-full bg-red-50 text-red-600 border border-red-200 text-sm rounded px-3 py-1.5 hover:bg-red-100 transition-colors"
            >
              Remover ajuste
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
