import type { Checkin } from "@/types/domain";

// ---------------------------------------------------------------------------
// Métricas derivadas — funções puras sobre uma lista de check-ins.
// Operam tanto sobre o histórico da API quanto sobre o log simulado da sessão
// (mesma fonte: Checkin[]), então o dashboard reage à simulação sem duplicar lógica.
// ---------------------------------------------------------------------------

function isSuccessfulEntry(checkin: Checkin): boolean {
  return checkin.action === "entry" && checkin.success;
}

/** Quantidade de check-ins (entradas) realizados com sucesso. */
export function checkinsRealizados(checkins: Checkin[]): number {
  return checkins.filter(isSuccessfulEntry).length;
}

/** Quantidade de tentativas que falharam. */
export function errosCount(checkins: Checkin[]): number {
  return checkins.filter((c) => !c.success).length;
}

/**
 * Taxa de entrada (0..100): proporção de participantes DISTINTOS que entraram
 * sobre o total esperado. Conta cada pessoa uma vez (VIP que entra N vezes não
 * infla a taxa). Guarda `expectedCount = 0` (EVT-004) para não dividir por zero.
 */
export function entryRatePercent(
  checkins: Checkin[],
  expectedCount: number,
): number {
  if (expectedCount <= 0) {
    return 0;
  }
  const distinctEntered = new Set(
    checkins.filter(isSuccessfulEntry).map((c) => c.participant_id),
  );
  return Math.round((distinctEntered.size / expectedCount) * 100);
}

export interface EntryPoint {
  /** Instante absoluto (epoch ms). Normaliza o fuso: os timestamps vêm em UTC. */
  time: number;
  /** Total acumulado de entradas até este instante. */
  cumulative: number;
}

/**
 * Série de entradas acumuladas ao longo do tempo, para o gráfico.
 * Os check-ins chegam fora de ordem e em UTC → ordenamos por instante absoluto
 * antes de acumular.
 */
export function entriesOverTime(checkins: Checkin[]): EntryPoint[] {
  const entries = checkins
    .filter(isSuccessfulEntry)
    .map((c) => Date.parse(c.timestamp))
    .sort((a, b) => a - b);

  return entries.map((time, index) => ({ time, cumulative: index + 1 }));
}

/** Proporção entre ações bem-sucedidas e tentativas com erro (gráfico opcional). */
export function successVsError(checkins: Checkin[]): {
  success: number;
  error: number;
} {
  let success = 0;
  let error = 0;
  for (const checkin of checkins) {
    if (checkin.success) {
      success += 1;
    } else {
      error += 1;
    }
  }
  return { success, error };
}
