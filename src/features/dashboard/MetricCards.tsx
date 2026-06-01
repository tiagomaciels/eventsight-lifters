import { AlertTriangle, Percent, UserCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { checkinsRealizados, entryRatePercent, errosCount } from "@/domain/metrics";
import { formatPercent } from "@/lib/format";
import { metricToken, type MetricToken } from "@/lib/tokens";
import type { Checkin, EventSummary } from "@/types/domain";

interface MetricCardsProps {
  event: EventSummary;
  checkins: Checkin[];
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  token: MetricToken;
}

function MetricCard({ label, value, icon: Icon, token }: MetricCardProps) {
  return (
    <Card className="shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${token.chip}`}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        </div>
        <span
          className={`text-3xl font-bold tabular-nums tracking-tight ${token.value}`}
        >
          {value}
        </span>
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
          icon={Users}
          token={metricToken.expected}
        />
        <MetricCard
          label="Check-ins Realizados"
          value={String(realizados)}
          icon={UserCheck}
          token={metricToken.checkins}
        />
        <MetricCard
          label="Tentativas com Erro"
          value={String(erros)}
          icon={AlertTriangle}
          token={metricToken.errors}
        />
        <MetricCard
          label="Taxa de Entrada"
          value={formatPercent(taxa)}
          icon={Percent}
          token={metricToken.rate}
        />
      </div>
    </section>
  );
}
