// ---------------------------------------------------------------------------
// Tipos de domínio — espelham o contrato da API (Opção A / GitHub Pages).
// Unions estritas; sem strings soltas.
// ---------------------------------------------------------------------------

export type EventStatus = "active" | "closed" | "cancelled";
export type ParticipantType = "vip" | "normal";
export type ParticipantStatus = "inside" | "outside";
export type CheckinAction = "entry" | "exit";
export type CheckinErrorReason = "already_checked_in" | "event_closed";

export interface EventSummary {
  id: string;
  name: string;
  date: string;
  location: string;
  status: EventStatus;
  description: string;
  expected_count: number;
  checkin_count: number;
  error_count: number;
  entry_rate: number;
}

export interface Participant {
  id: string;
  event_id: string;
  name: string;
  type: ParticipantType;
  status: ParticipantStatus;
  checkin_count: number;
}

export interface Checkin {
  id: string;
  event_id: string;
  participant_id: string;
  timestamp: string;
  success: boolean;
  action: CheckinAction;
  error_reason: CheckinErrorReason | null;
}

export interface EventDetail extends EventSummary {
  participants: Participant[];
  checkins: Checkin[];
}
