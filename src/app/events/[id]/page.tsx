"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StateBoundary } from "@/components/feedback/StateBoundary";
import { EntriesChart } from "@/features/dashboard/EntriesChart";
import { MetricCards } from "@/features/dashboard/MetricCards";
import { ParticipantsTable } from "@/features/dashboard/ParticipantsTable";
import { useEvent } from "@/features/events/hooks";
import { useCheckinStore } from "@/features/checkin/store";
import { statusBadge } from "@/lib/tokens";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Participant } from "@/types/domain";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-60 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function EventDashboardPage() {
  // useParams() é a forma correta em Client Components no Next.js 16
  // (params como prop é Promise em Server Components nesta versão).
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, isError, refetch } = useEvent(id);

  // O store Zustand é a fonte única de verdade do estado mutável da sessão.
  const seed = useCheckinStore((s) => s.seed);
  const apply = useCheckinStore((s) => s.apply);
  const statuses = useCheckinStore((s) => s.statuses);
  const log = useCheckinStore((s) => s.log);
  const seededEventId = useCheckinStore((s) => s.eventId);

  // Semeia o store quando o evento carrega (sincroniza store com dados externos;
  // não é busca de dados). Idempotente por evento dentro do próprio store.
  useEffect(() => {
    if (event) seed(event);
  }, [event, seed]);

  const ready = !!event && seededEventId === event.id;

  // Participantes exibidos: metadados da API + status vindo do store (quando
  // já semeado para ESTE evento). Evita vazar status de outro evento.
  const participants = useMemo<Participant[]>(() => {
    if (!event) return [];
    return event.participants.map((p) => ({
      ...p,
      status: ready ? (statuses[p.id] ?? p.status) : p.status,
    }));
  }, [event, statuses, ready]);

  // Check-ins exibidos: log do store (ao vivo) quando pronto, senão o da API.
  const checkins = ready ? log : (event?.checkins ?? []);

  const handleCheckin = useCallback(
    (participant: Participant) => apply(participant, event!),
    [apply, event],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para eventos
        </Link>
      </div>

      <StateBoundary
        isLoading={isLoading}
        isError={isError}
        isEmpty={false}
        skeleton={<DashboardSkeleton />}
        errorMessage="Falha ao carregar o evento. Verifique sua conexão e tente novamente."
        onRetry={refetch}
      >
        {event && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{event.location}</p>
              </div>
              <Badge className={statusBadge[event.status].className}>
                {statusBadge[event.status].label}
              </Badge>
            </div>

            <MetricCards event={event} checkins={checkins} />

            <section aria-label="Evolução de entradas ao longo do tempo">
              <h2 className="mb-4 text-lg font-semibold">Entradas ao longo do tempo</h2>
              <EntriesChart checkins={checkins} />
            </section>

            <section aria-label="Participantes do evento">
              <h2 className="mb-4 text-lg font-semibold">
                Participantes{" "}
                <span className="text-base font-normal text-muted-foreground">
                  ({participants.length})
                </span>
              </h2>
              <ParticipantsTable
                participants={participants}
                event={event}
                history={checkins}
                onCheckin={handleCheckin}
              />
            </section>
          </div>
        )}
      </StateBoundary>
    </main>
  );
}
