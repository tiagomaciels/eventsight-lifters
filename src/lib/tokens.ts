import type { EventStatus, ParticipantType, ParticipantStatus } from "@/types/domain";

// ---------------------------------------------------------------------------
// Design tokens — fonte única de verdade para cores e rótulos de status/tipo.
// Rótulos em PT-BR; chaves em inglês conforme API.
// ---------------------------------------------------------------------------

interface BadgeToken {
  label: string;
  className: string;
}

export const statusBadge: Record<EventStatus, BadgeToken> = {
  active: {
    label: "Ativo",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  closed: {
    label: "Encerrado",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  },
};

export const typeBadge: Record<ParticipantType, BadgeToken> = {
  vip: {
    label: "VIP",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  },
  normal: {
    label: "Normal",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
};

export const participantStatusToken: Record<ParticipantStatus, BadgeToken> = {
  inside: {
    label: "Presente",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  outside: {
    label: "Ausente",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

// ---------------------------------------------------------------------------
// Cores dos cards de métrica (Tailwind classes)
// ---------------------------------------------------------------------------

export const metricColor = {
  expected: "text-blue-600 dark:text-blue-400",
  checkins: "text-emerald-600 dark:text-emerald-400",
  errors: "text-red-600 dark:text-red-400",
  rate: "text-amber-600 dark:text-amber-400",
} as const;
