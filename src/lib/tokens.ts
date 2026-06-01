import type { EventStatus, ParticipantType, ParticipantStatus } from "@/types/domain";

// ---------------------------------------------------------------------------
// Design tokens — fonte única de verdade para cores e rótulos de status/tipo.
// Chrome do app é monocromático (slate); estas cores são SEMÂNTICAS (codificam
// informação) e por isso permanecem. Rótulos em PT-BR; chaves em inglês (API).
// ---------------------------------------------------------------------------

interface BadgeToken {
  label: string;
  className: string;
}

const badge = "ring-1 ring-inset";

export const statusBadge: Record<EventStatus, BadgeToken> = {
  active: {
    label: "Ativo",
    className: `bg-emerald-50 text-emerald-700 ${badge} ring-emerald-600/20`,
  },
  closed: {
    label: "Encerrado",
    className: `bg-rose-50 text-rose-700 ${badge} ring-rose-600/20`,
  },
  cancelled: {
    label: "Cancelado",
    className: `bg-rose-50 text-rose-700 ${badge} ring-rose-600/20`,
  },
};

/** Cor de acento (barra/ponto) por status — usada nos cards de evento. */
export const statusAccent: Record<EventStatus, string> = {
  active: "bg-emerald-500",
  closed: "bg-rose-500",
  cancelled: "bg-rose-400",
};

export const typeBadge: Record<ParticipantType, BadgeToken> = {
  vip: {
    label: "VIP",
    className: `bg-violet-50 text-violet-700 ${badge} ring-violet-600/20`,
  },
  normal: {
    label: "Normal",
    className: `bg-sky-50 text-sky-700 ${badge} ring-sky-600/20`,
  },
};

export const participantStatusToken: Record<ParticipantStatus, BadgeToken> = {
  inside: {
    label: "Presente",
    className: `bg-emerald-50 text-emerald-700 ${badge} ring-emerald-600/20`,
  },
  outside: {
    label: "Ausente",
    className: `bg-zinc-100 text-zinc-600 ${badge} ring-zinc-500/15`,
  },
};

// ---------------------------------------------------------------------------
// Cards de métrica: cor do número + chip do ícone (bg suave + ring)
// ---------------------------------------------------------------------------

export interface MetricToken {
  value: string;
  chip: string;
}

export const metricToken = {
  expected: {
    value: "text-sky-600",
    chip: `bg-sky-50 text-sky-600 ${badge} ring-sky-600/15`,
  },
  checkins: {
    value: "text-emerald-600",
    chip: `bg-emerald-50 text-emerald-600 ${badge} ring-emerald-600/15`,
  },
  errors: {
    value: "text-rose-600",
    chip: `bg-rose-50 text-rose-600 ${badge} ring-rose-600/15`,
  },
  rate: {
    value: "text-amber-600",
    chip: `bg-amber-50 text-amber-600 ${badge} ring-amber-600/15`,
  },
} as const satisfies Record<string, MetricToken>;
