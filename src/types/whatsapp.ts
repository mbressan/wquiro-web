export type WhatsAppMessageDirection = 'inbound' | 'outbound';
export type WhatsAppMessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export type WhatsAppMessageTrigger = 'automatic' | 'manual' | 'webhook';
export type MessageTemplateType =
  | 'appointment_reminder_24h'
  | 'appointment_reminder_2h'
  | 'booking_fee_request'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'nps_survey'
  | 'reengagement'
  | 'birthday'
  | 'custom';

export interface PatientReference {
  id: string;
  name: string;
}

export interface AppointmentReference {
  id: string;
}

export interface WhatsAppMessage {
  id: string;
  patient: PatientReference;
  appointment?: AppointmentReference | null;
  direction: WhatsAppMessageDirection;
  content: string;
  triggered_by: WhatsAppMessageTrigger;
  status: WhatsAppMessageStatus;
  external_message_id: string;
  error_message: string;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  template_type: MessageTemplateType;
  content: string;
  is_default: boolean;
  is_active: boolean;
}

export interface ClinicWhatsAppConfig {
  evolution_instance_name: string;
  is_configured: boolean;
  webhook_url: string;
  reminders_24h_enabled: boolean;
  reminders_2h_enabled: boolean;
  reengagement_enabled: boolean;
}

export interface SendWhatsAppPayload {
  patient: string;
  content: string;
  appointment?: string | null;
}

export interface WhatsAppMessageFilters {
  patient?: string;
  direction?: WhatsAppMessageDirection;
  status?: WhatsAppMessageStatus;
  sent_after?: string;
  sent_before?: string;
  page?: number;
  page_size?: number;
}

export interface ClinicWhatsAppConfigUpdate {
  evolution_instance_name?: string;
  is_configured?: boolean;
  reminders_24h_enabled?: boolean;
  reminders_2h_enabled?: boolean;
  reengagement_enabled?: boolean;
}

export interface PaginatedWhatsAppMessages {
  count: number;
  next: string | null;
  previous: string | null;
  results: WhatsAppMessage[];
}
