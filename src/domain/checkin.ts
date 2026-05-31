import type {
  Checkin,
  CheckinAction,
  CheckinErrorReason,
  EventSummary,
  Participant,
  ParticipantStatus,
} from "@/types/domain";

// ---------------------------------------------------------------------------
// Regras de check-in — funções puras, o coração do domínio.
// Recebem dados, retornam decisões. Sem React, sem fetch, sem window.
// ---------------------------------------------------------------------------

export type CheckinResult =
  | { ok: true; nextStatus: ParticipantStatus; action: CheckinAction }
  | { ok: false; reason: CheckinErrorReason };

/**
 * Elegibilidade do Normal deriva do HISTÓRICO de entradas, não do campo
 * `checkin_count` (inconsistente nos dados reais). "Já fez check-in" = teve
 * uma entrada bem-sucedida — por isso um Normal que entrou e saiu (status
 * `outside`) continua bloqueado para reentrar.
 */
function hasSuccessfulEntry(participantId: string, history: Checkin[]): boolean {
  return history.some(
    (c) =>
      c.participant_id === participantId && c.action === "entry" && c.success,
  );
}

/** Evento só aceita interações enquanto está ativo; closed/cancelled bloqueiam tudo. */
function isEventBlocked(event: EventSummary): boolean {
  return event.status !== "active";
}

/**
 * Decide a ação de check-in aplicando todas as regras de negócio.
 * A ação é inferida do status atual: quem está `outside` tenta entrar,
 * quem está `inside` tenta sair.
 */
export function attemptCheckin(
  participant: Participant,
  event: EventSummary,
  history: Checkin[],
): CheckinResult {
  // Evento encerrado/cancelado bloqueia qualquer interação (entrada ou saída).
  if (isEventBlocked(event)) {
    return { ok: false, reason: "event_closed" };
  }

  // Quem está dentro só pode sair — saída é sempre permitida em evento ativo.
  if (participant.status === "inside") {
    return { ok: true, nextStatus: "outside", action: "exit" };
  }

  // Está fora → tentativa de entrada. Normal só entra uma vez na vida.
  if (participant.type === "normal" && hasSuccessfulEntry(participant.id, history)) {
    return { ok: false, reason: "already_checked_in" };
  }

  return { ok: true, nextStatus: "inside", action: "entry" };
}

/** A entrada está disponível para este participante agora? */
export function canEnter(
  participant: Participant,
  event: EventSummary,
  history: Checkin[],
): boolean {
  if (event.status !== "active" || participant.status !== "outside") {
    return false;
  }
  return !(
    participant.type === "normal" && hasSuccessfulEntry(participant.id, history)
  );
}

/** A saída está disponível para este participante agora? */
export function canExit(participant: Participant, event: EventSummary): boolean {
  return event.status === "active" && participant.status === "inside";
}

/**
 * Motivo pelo qual nenhuma ação está disponível (para exibir em botão
 * desabilitado/tooltip), ou `null` quando há ação possível.
 */
export function checkinDisabledReason(
  participant: Participant,
  event: EventSummary,
  history: Checkin[],
): string | null {
  switch (event.status) {
    case "closed":
      return "Evento encerrado — check-ins bloqueados";
    case "cancelled":
      return "Evento cancelado — interações bloqueadas";
    case "active":
      break;
    default: {
      const _exhaustive: never = event.status;
      return _exhaustive;
    }
  }

  if (
    participant.status === "outside" &&
    participant.type === "normal" &&
    hasSuccessfulEntry(participant.id, history)
  ) {
    return "Participante já realizou check-in";
  }

  return null;
}
