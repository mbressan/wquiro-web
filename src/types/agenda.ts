export type AgendaEventType =
  | 'unavailable'
  | 'external_commitment'
  | 'personal_break';

export type RecurrenceFrequency = 'weekly' | 'monthly';

export type EventScope = 'single' | 'future' | 'series';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  /** 0=Monday … 6=Sunday — required when frequency=weekly */
  weekday?: number;
  /** 1–31 — required when frequency=monthly */
  day_of_month?: number;
  /** ISO date string — exclusive with count */
  until_date?: string;
  count?: number;
}

export interface AgendaEvent {
  id: string;
  professional: string;
  professional_name: string;
  start_at: string;
  end_at: string;
  event_type: AgendaEventType;
  title: string;
  description: string;
  recurrence_rule: RecurrenceRule | Record<string, never>;
  series_id: string | null;
  is_series_head: boolean;
  occurrence_date: string | null;
}

export interface AgendaEventCreate {
  professional: string;
  start_at: string;
  end_at: string;
  event_type: AgendaEventType;
  title: string;
  description?: string;
  recurrence_rule?: RecurrenceRule;
}

export interface AgendaEventUpdate {
  start_at?: string;
  end_at?: string;
  event_type?: AgendaEventType;
  title?: string;
  description?: string;
}

/** Agenda context: undefined = general (all professionals), string = professional id */
export type AgendaContext = string | undefined;
