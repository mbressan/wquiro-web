import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AgendaContext } from '@/types/agenda';

const PARAM_KEY = 'professional';

/**
 * Persists the selected agenda context (general or per-professional) in the URL
 * so that navigating away and back preserves the selection.
 */
export function useAgendaContext(): [AgendaContext, (ctx: AgendaContext) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const context: AgendaContext = searchParams.get(PARAM_KEY) ?? undefined;

  const setContext = useCallback(
    (ctx: AgendaContext) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (ctx) {
          next.set(PARAM_KEY, ctx);
        } else {
          next.delete(PARAM_KEY);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  return [context, setContext];
}
