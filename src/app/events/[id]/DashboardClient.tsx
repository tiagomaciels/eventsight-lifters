"use client";

import { useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { StateBoundary } from "@/components/feedback/StateBoundary";
import { EntriesChart } from "@/features/dashboard/EntriesChart";
import { MetricCards } from "@/features/dashboard/MetricCards";
import { ParticipantsTable } from "@/features/dashboard/ParticipantsTable";
import { useEvent } from "@/features/events/hooks";
import { useCheckinStore } from "@/features/checkin/store";
import { formatDate } from "@/lib/format";
import { statusBadge } from "@/lib/tokens";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Participant } from "@/types/domain";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

interface DashboardClientProps {
  id: string;
}

export function DashboardClient({ id }: DashboardClientProps) {
  const { data: event, isLoading, isError, refetch } = useEvent(id);

  const seed = useCheckinStore((s) => s.seed);
  const apply = useCheckinStore((s) => s.apply);
  const statuses = useCheckinStore((s) => s.statuses);
  const log = useCheckinStore((s) => s.log);
  const seededEventId = useCheckinStore((s) => s.eventId);

  // Semeia o store quando o evento carrega. Idempotente por evento.
  useEffect(() => {
    if (event) seed(event);
  }, [event, seed]);

  const ready = !!event && seededEventId === event.id;

  const participants = useMemo<Participant[]>(() => {
    if (!event) return [];
    return event.participants.map((p) => ({
      ...p,
      status: ready ? (statuses[p.id] ?? p.status) : p.status,
    }));
  }, [event, statuses, ready]);

  const checkins = ready ? log : (event?.checkins ?? []);

  const handleCheckin = useCallback(
    (participant: Participant) => apply(participant, event!),
    [apply, event],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
            {/* Hero do evento */}
            <Card className="shadow-xs">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-foreground/40" aria-hidden="true" />
                      <time dateTime={event.date}>{formatDate(event.date)}</time>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-foreground/40" aria-hidden="true" />
                      {event.location}
                    </span>
                  </div>
                  {event.description && (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
                <Badge className={`shrink-0 ${statusBadge[event.status].className}`}>
                  {statusBadge[event.status].label}
                </Badge>
              </CardContent>
            </Card>

            <MetricCards event={event} checkins={checkins} />

            {/* Gráfico */}
            <section>
              <h2 className="mb-3 text-lg font-semibold tracking-tight">
                Entradas ao longo do tempo
              </h2>
              <Card className="shadow-xs">
                <CardContent className="px-2 py-6 sm:px-5">
                  <EntriesChart checkins={checkins} />
                </CardContent>
              </Card>
            </section>

            {/* Participantes */}
            <section>
              <h2 className="mb-3 text-lg font-semibold tracking-tight">
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
