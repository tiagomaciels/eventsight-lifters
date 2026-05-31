import { describe, it, expect, beforeEach } from "vitest";
import { useCheckinStore } from "./store";
import type {
  Checkin,
  EventDetail,
  EventSummary,
  Participant,
  ParticipantStatus,
  ParticipantType,
} from "@/types/domain";

function makeEvent(status: EventSummary["status"] = "active"): EventSummary {
  return {
    id: "EVT-001",
    name: "Evento",
    date: "2026-01-01T20:00:00-03:00",
    location: "Local",
    status,
    description: "",
    expected_count: 100,
    checkin_count: 0,
    error_count: 0,
    entry_rate: 0,
  };
}

function makeParticipant(
  id: string,
  type: ParticipantType,
  status: ParticipantStatus,
): Participant {
  return { id, event_id: "EVT-001", name: id, type, status, checkin_count: 0 };
}

function entry(participantId: string): Checkin {
  return {
    id: `chk-${participantId}`,
    event_id: "EVT-001",
    participant_id: participantId,
    timestamp: "2026-01-01T23:00:00Z",
    success: true,
    action: "entry",
    error_reason: null,
  };
}

function makeDetail(overrides: Partial<EventDetail> = {}): EventDetail {
  return {
    ...makeEvent(),
    participants: [],
    checkins: [],
    ...overrides,
  };
}

beforeEach(() => {
  useCheckinStore.getState().reset();
});

describe("checkin store", () => {
  it("semeia status e log a partir do detalhe", () => {
    const detail = makeDetail({
      participants: [makeParticipant("P1", "vip", "outside")],
      checkins: [entry("P1")],
    });

    useCheckinStore.getState().seed(detail);

    const state = useCheckinStore.getState();
    expect(state.eventId).toBe("EVT-001");
    expect(state.statuses).toEqual({ P1: "outside" });
    expect(state.log).toHaveLength(1);
  });

  it("não sobrescreve ações ao re-semear o mesmo evento (idempotente)", () => {
    const detail = makeDetail({
      participants: [makeParticipant("P1", "vip", "outside")],
    });
    const store = useCheckinStore.getState();

    store.seed(detail);
    store.apply(makeParticipant("P1", "vip", "outside"), makeEvent()); // P1 → inside
    store.seed(detail); // re-seed não deve resetar

    expect(useCheckinStore.getState().statuses.P1).toBe("inside");
  });

  it("aplica a entrada de um VIP e registra no log", () => {
    const store = useCheckinStore.getState();
    store.seed(makeDetail({ participants: [makeParticipant("P1", "vip", "outside")] }));

    const result = store.apply(makeParticipant("P1", "vip", "outside"), makeEvent());

    expect(result).toEqual({ ok: true, nextStatus: "inside", action: "entry" });
    expect(useCheckinStore.getState().statuses.P1).toBe("inside");
    expect(useCheckinStore.getState().log).toHaveLength(1);
  });

  it("usa o status do store, não o do prop, ao decidir (saída após entrada)", () => {
    const store = useCheckinStore.getState();
    store.seed(makeDetail({ participants: [makeParticipant("P1", "vip", "outside")] }));
    store.apply(makeParticipant("P1", "vip", "outside"), makeEvent()); // inside

    // mesmo passando "outside" no prop, o store sabe que está inside → saída
    const result = store.apply(makeParticipant("P1", "vip", "outside"), makeEvent());

    expect(result).toEqual({ ok: true, nextStatus: "outside", action: "exit" });
  });

  it("bloqueia a segunda entrada de um normal sem mutar o estado", () => {
    const store = useCheckinStore.getState();
    store.seed(
      makeDetail({
        participants: [makeParticipant("P1", "normal", "outside")],
        checkins: [entry("P1")],
      }),
    );

    const result = store.apply(makeParticipant("P1", "normal", "outside"), makeEvent());

    expect(result).toEqual({ ok: false, reason: "already_checked_in" });
    expect(useCheckinStore.getState().log).toHaveLength(1); // inalterado
    expect(useCheckinStore.getState().statuses.P1).toBe("outside");
  });

  it("bloqueia interações em evento encerrado", () => {
    const store = useCheckinStore.getState();
    store.seed(makeDetail({ participants: [makeParticipant("P1", "vip", "outside")] }));

    const result = store.apply(
      makeParticipant("P1", "vip", "outside"),
      makeEvent("closed"),
    );

    expect(result).toEqual({ ok: false, reason: "event_closed" });
    expect(useCheckinStore.getState().statuses.P1).toBe("outside");
  });
});
