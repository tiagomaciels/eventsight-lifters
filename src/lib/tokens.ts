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
    className: `bg-emerald-50 text-emerald-700 ${badge} ring-emerald-600/20 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-500/30`,
  },
  closed: {
    label: "Encerrado",
    className: `bg-rose-50 text-rose-700 ${badge} ring-rose-600/20 dark:bg-rose-900/40 dark:text-rose-300 dark:ring-rose-500/30`,
  },
  cancelled: {
    label: "Cancelado",
    className: `bg-rose-50 text-rose-700 ${badge} ring-rose-600/20 dark:bg-rose-900/40 dark:text-rose-300 dark:ring-rose-500/30`,
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
    className: `bg-violet-50 text-violet-700 ${badge} ring-violet-600/20 dark:bg-violet-900/40 dark:text-violet-300 dark:ring-violet-500/30`,
  },
  normal: {
    label: "Normal",
    className: `bg-sky-50 text-sky-700 ${badge} ring-sky-600/20 dark:bg-sky-900/40 dark:text-sky-300 dark:ring-sky-500/30`,
  },
};

export const participantStatusToken: Record<ParticipantStatus, BadgeToken> = {
  inside: {
    label: "Presente",
    className: `bg-emerald-50 text-emerald-700 ${badge} ring-emerald-600/20 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-500/30`,
  },
  outside: {
    label: "Ausente",
    className: `bg-zinc-100 text-zinc-600 ${badge} ring-zinc-500/15 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-600/20`,
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
    value: "text-sky-600 dark:text-sky-400",
    chip: `bg-sky-50 text-sky-600 ${badge} ring-sky-600/15 dark:bg-sky-900/40 dark:text-sky-400 dark:ring-sky-500/30`,
  },
  checkins: {
    value: "text-emerald-600 dark:text-emerald-400",
    chip: `bg-emerald-50 text-emerald-600 ${badge} ring-emerald-600/15 dark:bg-emerald-900/40 dark:text-emerald-400 dark:ring-emerald-500/30`,
  },
  errors: {
    value: "text-rose-600 dark:text-rose-400",
    chip: `bg-rose-50 text-rose-600 ${badge} ring-rose-600/15 dark:bg-rose-900/40 dark:text-rose-400 dark:ring-rose-500/30`,
  },
  rate: {
    value: "text-amber-600 dark:text-amber-400",
    chip: `bg-amber-50 text-amber-600 ${badge} ring-amber-600/15 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-500/30`,
  },
} as const satisfies Record<string, MetricToken>;
