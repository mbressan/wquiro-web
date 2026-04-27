import { useState } from "react";
import { Skeleton } from "@/components/ui";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useSpineMapHistory } from "@/hooks/useSpineMapHistory";
import { SpineMapCanvas } from "./SpineMapCanvas";
import type { SpineMapHistoryEntry } from "@/types/spineMap";

interface SpineMapTimelineProps {
  patientId: string;
}

interface EntryCardProps {
  entry: SpineMapHistoryEntry;
}

function EntryCard({ entry }: EntryCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const formattedDate = format(parseISO(entry.date), "dd/MM/yyyy", { locale: ptBR });

  return (
    <div className="relative border border-gray-200 rounded-lg bg-white shadow-sm">
      <button
        type="button"
        className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
        onClick={() => setShowDetail((v) => !v)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-800">{formattedDate}</span>
          <span className="text-xs text-gray-500">{entry.professional_name}</span>
        </div>
        <SpineMapCanvas
          selected={entry.spine_map.adjusted}
          techniques={entry.spine_map.techniques}
          onChange={() => undefined}
          readOnly
          width={100}
        />
        {entry.spine_map.adjusted.length > 0 && (
          <p className="mt-2 text-xs text-blue-600">
            {entry.spine_map.adjusted.join(", ")}
          </p>
        )}
      </button>

      {showDetail && (
        <div className="border-t border-gray-100 p-3 bg-gray-50 rounded-b-lg">
          <p className="text-xs font-semibold text-gray-700 mb-1">Profissional: {entry.professional_name}</p>
          <p className="text-xs font-semibold text-gray-700 mb-1">Data: {formattedDate}</p>
          {entry.spine_map.techniques.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Técnicas:</p>
              <ul className="space-y-0.5">
                {entry.spine_map.techniques.map((t) => (
                  <li key={t.vertebra} className="text-xs text-gray-600">
                    <span className="font-medium">{t.vertebra}</span>: {t.technique}
                    {t.notes && <span className="text-gray-400"> ({t.notes})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {entry.spine_map.notes && (
            <p className="mt-2 text-xs text-gray-600">
              <span className="font-semibold">Obs: </span>{entry.spine_map.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function SpineMapTimeline({ patientId }: SpineMapTimelineProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useSpineMapHistory(patientId, page);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-red-500">Erro ao carregar histórico de mapas vertebrais.</p>;
  }

  const entries = data ?? [];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800">Histórico de Mapas Vertebrais</h3>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum mapa registrado.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {entries.length === 10 && (
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          className="w-full text-sm text-blue-600 hover:text-blue-700 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Carregar mais
        </button>
      )}
    </div>
  );
}
