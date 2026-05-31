"use client";

import { useMemo, useState } from "react";
import { StateBoundary } from "@/components/feedback/StateBoundary";
import { EventFilters, type StatusFilter, type SortOrder } from "@/features/events/EventFilters";
import { EventList } from "@/features/events/EventList";
import { EventListSkeleton } from "@/features/events/EventCardSkeleton";
import { useEvents } from "@/features/events/hooks";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

export default function Home() {
  const { data: events, isLoading, isError, refetch } = useEvents();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const debouncedSearch = useDebouncedValue(search, 300);

  const filtered = useMemo(() => {
    if (!events) return [];

    return events
      .filter((e) => {
        const matchesSearch = e.name
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const diff =
          new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === "asc" ? diff : -diff;
      });
  }, [events, debouncedSearch, statusFilter, sortOrder]);

  const hasActiveFilters =
    debouncedSearch !== "" || statusFilter !== "all";

  const emptyMessage = hasActiveFilters
    ? "Nenhum evento encontrado para os filtros aplicados."
    : "Nenhum evento disponível.";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Eventos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie e acompanhe os eventos cadastrados.
        </p>
      </div>

      <div className="mb-6">
        <EventFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
      </div>

      <StateBoundary
        isLoading={isLoading}
        isError={isError}
        isEmpty={filtered.length === 0}
        skeleton={<EventListSkeleton />}
        errorMessage="Falha ao carregar os eventos. Verifique sua conexão e tente novamente."
        emptyMessage={emptyMessage}
        onRetry={refetch}
      >
        <EventList events={filtered} />
      </StateBoundary>
    </main>
  );
}
