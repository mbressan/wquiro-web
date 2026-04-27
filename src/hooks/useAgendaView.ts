import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export type ViewMode = 'resourceTimeGridDay' | 'timeGridWeek' | 'dayGridMonth';

const VIEW_PARAM_MAP: Record<string, ViewMode> = {
  day: 'resourceTimeGridDay',
  week: 'timeGridWeek',
  month: 'dayGridMonth',
};

const VIEW_REVERSE_MAP: Record<ViewMode, string> = {
  resourceTimeGridDay: 'day',
  timeGridWeek: 'week',
  dayGridMonth: 'month',
};

/**
 * Persists the selected agenda view mode in the URL (?view=day|week|month)
 * so that navigating away and back preserves the selection.
 */
export function useAgendaView(): [ViewMode, (v: ViewMode) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get('view') ?? 'day';
  const viewMode: ViewMode = VIEW_PARAM_MAP[param] ?? 'resourceTimeGridDay';

  const setViewMode = useCallback(
    (v: ViewMode) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('view', VIEW_REVERSE_MAP[v]);
        return next;
      });
    },
    [setSearchParams],
  );

  return [viewMode, setViewMode];
}
