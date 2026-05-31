import { describe, it, expect } from "vitest";
import {
  checkinsRealizados,
  entriesOverTime,
  entryRatePercent,
  errosCount,
  successVsError,
} from "./metrics";
import type { Checkin, CheckinAction } from "@/types/domain";

// ---------------------------------------------------------------------------
// Fixtures de check-in
// ---------------------------------------------------------------------------

interface CheckinOverrides {
  participant_id?: string;
  timestamp?: string;
  success?: boolean;
  action?: CheckinAction;
}

function checkin(overrides: CheckinOverrides = {}): Checkin {
  const success = overrides.success ?? true;
  const action = overrides.action ?? "entry";
  return {
    id: `chk-${Math.random()}`,
    event_id: "EVT-001",
    participant_id: overrides.participant_id ?? "P001",
    timestamp: overrides.timestamp ?? "2026-01-01T23:00:00Z",
    success,
    action,
    error_reason: success ? null : "already_checked_in",
  };
}

describe("checkinsRealizados", () => {
  it("conta apenas entradas bem-sucedidas", () => {
    const checkins = [
      checkin({ action: "entry", success: true }),
      checkin({ action: "entry", success: true }),
      checkin({ action: "exit", success: true }), // saída não é check-in
      checkin({ action: "entry", success: false }), // tentativa falha não conta
    ];
    expect(checkinsRealizados(checkins)).toBe(2);
  });

  it("é zero para lista vazia", () => {
    expect(checkinsRealizados([])).toBe(0);
  });
});

describe("errosCount", () => {
  it("conta tentativas malsucedidas", () => {
    const checkins = [
      checkin({ success: true }),
      checkin({ success: false }),
      checkin({ success: false }),
    ];
    expect(errosCount(checkins)).toBe(2);
  });
});

describe("entryRatePercent", () => {
  it("é a proporção de participantes distintos que entraram sobre o esperado", () => {
    // P001 entrou 2x (conta 1x), P002 entrou 1x → 2 distintos de 4 esperados = 50%
    const checkins = [
      checkin({ participant_id: "P001", action: "entry" }),
      checkin({ participant_id: "P001", action: "entry" }),
      checkin({ participant_id: "P002", action: "entry" }),
    ];
    expect(entryRatePercent(checkins, 4)).toBe(50);
  });

  it("arredonda para o inteiro mais próximo", () => {
    const checkins = [
      checkin({ participant_id: "P001" }),
      checkin({ participant_id: "P002" }),
    ];
    // 2 / 3 = 66,6% → 67
    expect(entryRatePercent(checkins, 3)).toBe(67);
  });

  it("retorna 0 quando expected_count é 0 (EVT-004), sem dividir por zero", () => {
    expect(entryRatePercent([], 0)).toBe(0);
    expect(entryRatePercent([checkin()], 0)).toBe(0);
  });

  it("ignora entradas que falharam", () => {
    const checkins = [checkin({ participant_id: "P001", success: false })];
    expect(entryRatePercent(checkins, 2)).toBe(0);
  });
});

describe("entriesOverTime", () => {
  it("ordena por timestamp e acumula as entradas bem-sucedidas", () => {
    // propositalmente fora de ordem
    const checkins = [
      checkin({ timestamp: "2026-01-01T22:00:00Z" }),
      checkin({ timestamp: "2026-01-01T20:00:00Z" }),
      checkin({ timestamp: "2026-01-01T21:00:00Z" }),
    ];
    const series = entriesOverTime(checkins);
    expect(series.map((p) => p.cumulative)).toEqual([1, 2, 3]);
    expect(series.map((p) => p.time)).toEqual([
      Date.parse("2026-01-01T20:00:00Z"),
      Date.parse("2026-01-01T21:00:00Z"),
      Date.parse("2026-01-01T22:00:00Z"),
    ]);
  });

  it("ignora saídas e tentativas falhas", () => {
    const checkins = [
      checkin({ action: "entry", success: true }),
      checkin({ action: "exit", success: true }),
      checkin({ action: "entry", success: false }),
    ];
    expect(entriesOverTime(checkins).map((p) => p.cumulative)).toEqual([1]);
  });

  it("retorna lista vazia sem check-ins (gráfico vazio do EVT-004)", () => {
    expect(entriesOverTime([])).toEqual([]);
  });
});

describe("successVsError", () => {
  it("separa ações bem-sucedidas de tentativas com erro", () => {
    const checkins = [
      checkin({ success: true }),
      checkin({ action: "exit", success: true }),
      checkin({ success: false }),
    ];
    expect(successVsError(checkins)).toEqual({ success: 2, error: 1 });
  });
});
