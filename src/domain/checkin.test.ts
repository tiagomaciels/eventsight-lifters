import { describe, it, expect } from "vitest";
import {
  attemptCheckin,
  canEnter,
  canExit,
  checkinDisabledReason,
} from "./checkin";
import type {
  Checkin,
  EventStatus,
  EventSummary,
  Participant,
  ParticipantStatus,
  ParticipantType,
} from "@/types/domain";

// ---------------------------------------------------------------------------
// Fixtures — apenas os campos relevantes para a decisão importam; o resto é
// preenchido com valores neutros para satisfazer os tipos.
// ---------------------------------------------------------------------------

function makeEvent(status: EventStatus): EventSummary {
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
  type: ParticipantType,
  status: ParticipantStatus,
): Participant {
  return {
    id: "P001",
    event_id: "EVT-001",
    name: "Participante",
    type,
    status,
    checkin_count: 0,
  };
}

function entry(participantId: string, success = true): Checkin {
  return {
    id: `chk-${Math.random()}`,
    event_id: "EVT-001",
    participant_id: participantId,
    timestamp: "2026-01-01T23:00:00Z",
    success,
    action: "entry",
    error_reason: success ? null : "already_checked_in",
  };
}

describe("attemptCheckin", () => {
  describe("VIP", () => {
    it("permite entrada quando está fora", () => {
      const result = attemptCheckin(
        makeParticipant("vip", "outside"),
        makeEvent("active"),
        [],
      );
      expect(result).toEqual({
        ok: true,
        nextStatus: "inside",
        action: "entry",
      });
    });

    it("permite saída quando está dentro", () => {
      const result = attemptCheckin(
        makeParticipant("vip", "inside"),
        makeEvent("active"),
        [entry("P001")],
      );
      expect(result).toEqual({
        ok: true,
        nextStatus: "outside",
        action: "exit",
      });
    });

    it("permite reentrada após sair (alterna livremente)", () => {
      const vip = makeParticipant("vip", "outside");
      // já entrou e saiu antes — mesmo assim pode reentrar
      const result = attemptCheckin(vip, makeEvent("active"), [entry("P001")]);
      expect(result).toEqual({
        ok: true,
        nextStatus: "inside",
        action: "entry",
      });
    });
  });

  describe("Normal", () => {
    it("permite a primeira entrada", () => {
      const result = attemptCheckin(
        makeParticipant("normal", "outside"),
        makeEvent("active"),
        [],
      );
      expect(result).toEqual({
        ok: true,
        nextStatus: "inside",
        action: "entry",
      });
    });

    it("bloqueia a segunda entrada (já tem entrada no histórico)", () => {
      const result = attemptCheckin(
        makeParticipant("normal", "outside"),
        makeEvent("active"),
        [entry("P001")],
      );
      expect(result).toEqual({ ok: false, reason: "already_checked_in" });
    });

    it("bloqueia nova entrada mesmo após ter saído (outside com histórico)", () => {
      // Edge case proposital: normal entrou, saiu, está outside — continua bloqueado.
      const normal = makeParticipant("normal", "outside");
      const result = attemptCheckin(normal, makeEvent("active"), [
        entry("P001"),
      ]);
      expect(result).toEqual({ ok: false, reason: "already_checked_in" });
    });

    it("permite saída quando está dentro", () => {
      const result = attemptCheckin(
        makeParticipant("normal", "inside"),
        makeEvent("active"),
        [entry("P001")],
      );
      expect(result).toEqual({
        ok: true,
        nextStatus: "outside",
        action: "exit",
      });
    });

    it("ignora tentativas de entrada que falharam ao decidir elegibilidade", () => {
      // Uma tentativa malsucedida no histórico não conta como "já entrou".
      const result = attemptCheckin(
        makeParticipant("normal", "outside"),
        makeEvent("active"),
        [entry("P001", false)],
      );
      expect(result).toEqual({
        ok: true,
        nextStatus: "inside",
        action: "entry",
      });
    });
  });

  describe("evento bloqueado", () => {
    it("bloqueia entrada em evento encerrado", () => {
      const result = attemptCheckin(
        makeParticipant("vip", "outside"),
        makeEvent("closed"),
        [],
      );
      expect(result).toEqual({ ok: false, reason: "event_closed" });
    });

    it("bloqueia entrada em evento cancelado", () => {
      const result = attemptCheckin(
        makeParticipant("vip", "outside"),
        makeEvent("cancelled"),
        [],
      );
      expect(result).toEqual({ ok: false, reason: "event_closed" });
    });

    it("bloqueia até a saída de quem está dentro num evento encerrado", () => {
      const result = attemptCheckin(
        makeParticipant("vip", "inside"),
        makeEvent("closed"),
        [entry("P001")],
      );
      expect(result).toEqual({ ok: false, reason: "event_closed" });
    });
  });
});

describe("canEnter", () => {
  it("é verdadeiro para VIP fora em evento ativo", () => {
    expect(canEnter(makeParticipant("vip", "outside"), makeEvent("active"), [])).toBe(
      true,
    );
  });

  it("é falso para normal que já entrou", () => {
    expect(
      canEnter(makeParticipant("normal", "outside"), makeEvent("active"), [
        entry("P001"),
      ]),
    ).toBe(false);
  });

  it("é falso quando o evento não está ativo", () => {
    expect(
      canEnter(makeParticipant("vip", "outside"), makeEvent("closed"), []),
    ).toBe(false);
  });

  it("é falso para quem já está dentro", () => {
    expect(
      canEnter(makeParticipant("vip", "inside"), makeEvent("active"), [entry("P001")]),
    ).toBe(false);
  });
});

describe("canExit", () => {
  it("é verdadeiro para quem está dentro em evento ativo", () => {
    expect(canExit(makeParticipant("vip", "inside"), makeEvent("active"))).toBe(true);
  });

  it("é falso para quem está fora", () => {
    expect(canExit(makeParticipant("vip", "outside"), makeEvent("active"))).toBe(
      false,
    );
  });

  it("é falso em evento encerrado", () => {
    expect(canExit(makeParticipant("vip", "inside"), makeEvent("closed"))).toBe(false);
  });
});

describe("checkinDisabledReason", () => {
  it("retorna null quando há ação disponível", () => {
    expect(
      checkinDisabledReason(makeParticipant("vip", "outside"), makeEvent("active"), []),
    ).toBeNull();
  });

  it("explica evento encerrado", () => {
    expect(
      checkinDisabledReason(makeParticipant("vip", "outside"), makeEvent("closed"), []),
    ).toMatch(/encerrado/i);
  });

  it("explica evento cancelado", () => {
    expect(
      checkinDisabledReason(
        makeParticipant("vip", "outside"),
        makeEvent("cancelled"),
        [],
      ),
    ).toMatch(/cancelado/i);
  });

  it("explica que o normal já fez check-in", () => {
    expect(
      checkinDisabledReason(makeParticipant("normal", "outside"), makeEvent("active"), [
        entry("P001"),
      ]),
    ).toMatch(/já realizou check-in/i);
  });
});
