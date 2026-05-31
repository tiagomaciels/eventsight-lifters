/**
 * Formata uma data ISO 8601 para exibição em pt-BR.
 * Recebe strings com offset (-03:00) ou UTC (Z) e normaliza o fuso
 * antes de formatar — os dados da API misturam os dois formatos.
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

/** Formata um número de 0 a 100 como percentual (ex.: 92 → "92%"). */
export function formatPercent(value: number): string {
  return `${value}%`;
}
