"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StateBoundary } from "@/components/feedback/StateBoundary";
import { EntriesChart } from "@/features/dashboard/EntriesChart";
import { MetricCards } from "@/features/dashboard/MetricCards";
import { ParticipantsTable } from "@/features/dashboard/ParticipantsTable";
import { useEvent } from "@/features/events/hooks";
import { statusBadge } from "@/lib/tokens";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Checkin, Participant } from "@/types/domain";

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
  // (params como prop é Promise em Server Components nesta versão)
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, isError, refetch } = useEvent(id);

  // O store de check-in (Sessão 5) vai substituir este estado local.
  // Por ora, mantemos uma cópia local de participants e checkins para
  // que a tabela já seja renderizável e o CheckinButton já funcione de forma básica.
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  // Semeia o estado local UMA vez quando o event carrega (simulação da Sessão 5)
  const [seeded, setSeeded] = useState(false);
  if (event && !seeded) {
    setParticipants(event.participants);
    setCheckins(event.checkins);
    setSeeded(true);
  }

  const handleCheckin = useCallback(
    (participantId: string) => {
      if (!event) return;

      setParticipants((prev) =>
        prev.map((p) => {
          if (p.id !== participantId) return p;
          return {
            ...p,
            status: p.status === "inside" ? "outside" : "inside",
          };
        }),
      );

      const action =
        participants.find((p) => p.id === participantId)?.status === "outside"
          ? "entry"
          : "exit";

      setCheckins((prev) => [
        ...prev,
        {
          id: `sim-${Date.now()}`,
          event_id: event.id,
          participant_id: participantId,
          timestamp: new Date().toISOString(),
          success: true,
          action,
          error_reason: null,
        },
      ]);
    },
    [event, participants],
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
            {/* Cabeçalho */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{event.location}</p>
              </div>
              <Badge className={statusBadge[event.status].className}>
                {statusBadge[event.status].label}
              </Badge>
            </div>

            {/* Cards de métrica */}
            <MetricCards event={event} checkins={checkins} />

            {/* Gráfico */}
            <section aria-label="Evolução de entradas ao longo do tempo">
              <h2 className="mb-4 text-lg font-semibold">Entradas ao longo do tempo</h2>
              <EntriesChart checkins={checkins} />
            </section>

            {/* Tabela de participantes */}
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
