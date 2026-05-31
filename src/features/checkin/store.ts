import { create } from "zustand";
import { attemptCheckin, type CheckinResult } from "@/domain/checkin";
import type {
  Checkin,
  EventDetail,
  EventSummary,
  Participant,
  ParticipantStatus,
} from "@/types/domain";

// ---------------------------------------------------------------------------
// Store de check-in — único dono do estado MUTÁVEL da simulação da sessão
// (status dos participantes + log de entradas/saídas). Semeado uma vez a
// partir do detalhe e dono dele a partir daí. Não sincroniza com o cache do
// React Query: a decisão de negócio vem do domínio puro, o store só aplica.
// ---------------------------------------------------------------------------

interface CheckinStore {
  /** Evento atualmente semeado — usado para semear só uma vez por evento. */
  eventId: string | null;
  statuses: Record<string, ParticipantStatus>;
  log: Checkin[];
  seed: (detail: EventDetail) => void;
  apply: (participant: Participant, event: EventSummary) => CheckinResult;
  reset: () => void;
}

export const useCheckinStore = create<CheckinStore>((set, get) => ({
  eventId: null,
  statuses: {},
  log: [],

  seed: (detail) => {
    // Idempotente por evento: não sobrescreve as ações simuladas em re-renders.
    // Ao trocar de evento, re-semeia com os dados do novo.
    if (get().eventId === detail.id) return;

    const statuses: Record<string, ParticipantStatus> = {};
    for (const participant of detail.participants) {
      statuses[participant.id] = participant.status;
    }

    set({ eventId: detail.id, statuses, log: [...detail.checkins] });
  },

  apply: (participant, event) => {
    const state = get();
    // O status atual é o do store (fonte de verdade), não o do prop recebido.
    const currentStatus = state.statuses[participant.id] ?? participant.status;
    const effective: Participant = { ...participant, status: currentStatus };

    const result = attemptCheckin(effective, event, state.log);

    if (result.ok) {
      const checkin: Checkin = {
        id: `sim-${Date.now()}-${state.log.length}`,
        event_id: event.id,
        participant_id: participant.id,
        timestamp: new Date().toISOString(),
        success: true,
        action: result.action,
        error_reason: null,
      };

      set({
        statuses: { ...state.statuses, [participant.id]: result.nextStatus },
        log: [...state.log, checkin],
      });
    }

    return result;
  },

  reset: () => set({ eventId: null, statuses: {}, log: [] }),
}));
