import { Card, CardContent } from "@/components/ui/card";
import { checkinsRealizados, entryRatePercent, errosCount } from "@/domain/metrics";
import { formatPercent } from "@/lib/format";
import { metricColor } from "@/lib/tokens";
import type { Checkin, EventSummary } from "@/types/domain";

interface MetricCardsProps {
  event: EventSummary;
  checkins: Checkin[];
}

interface MetricCardProps {
  label: string;
  value: string;
  colorClass: string;
}

function MetricCard({ label, value, colorClass }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-1 py-6 text-center">
        <span className={`text-4xl font-bold tabular-nums ${colorClass}`}>
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

export function MetricCards({ event, checkins }: MetricCardsProps) {
  const realizados = checkinsRealizados(checkins);
  const erros = errosCount(checkins);
  const taxa = entryRatePercent(checkins, event.expected_count);

  return (
    <section aria-label="Métricas do evento">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Participantes Esperados"
          value={String(event.expected_count)}
          colorClass={metricColor.expected}
        />
        <MetricCard
          label="Check-ins Realizados"
          value={String(realizados)}
          colorClass={metricColor.checkins}
        />
        <MetricCard
          label="Tentativas com Erro"
          value={String(erros)}
          colorClass={metricColor.errors}
        />
        <MetricCard
          label="Taxa de Entrada"
          value={formatPercent(taxa)}
          colorClass={metricColor.rate}
        />
      </div>
    </section>
  );
}
